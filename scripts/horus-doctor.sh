#!/bin/bash
# HORUS OS — "Fix My Environment"
# Diagnoses common maker/dev problems and offers safe automatic fixes:
# serial-port permissions, broken apt, missing pip, Arduino index, etc.
#
# Usage: horus-doctor [--fix]
set -uo pipefail

GOLD='\033[38;2;201;162;39m'; CYAN='\033[38;2;0;212;255m'
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok(){   echo -e "${GREEN}  ✓${NC} $1"; }
bad(){  echo -e "${RED}  ✗${NC} $1"; }
warn(){ echo -e "${YELLOW}  ⚠${NC} $1"; }
head(){ echo -e "\n${GOLD}▶ $1${NC}"; }

FIX=0; [[ "${1:-}" == "--fix" ]] && FIX=1
SUDO=""; [[ $EUID -ne 0 ]] && SUDO="sudo"
ISSUES=0

echo -e "${GOLD}HORUS Doctor${NC} — environment check $( [[ $FIX -eq 1 ]] && echo '(auto-fix on)' )"

# 1. Serial port access (dialout group) — #1 maker pain point
head "Serial port access"
if id -nG "$USER" | grep -qw dialout; then
  ok "$USER is in the 'dialout' group (serial access OK)"
else
  bad "$USER is NOT in 'dialout' — uploads to Arduino/ESP will fail"
  ((ISSUES++))
  if [[ $FIX -eq 1 ]]; then
    $SUDO usermod -aG dialout "$USER" && warn "Added to dialout — log out and back in to apply"
  else warn "Fix: sudo usermod -aG dialout $USER  (then re-login)"; fi
fi
for g in i2c gpio plugdev; do
  getent group "$g" >/dev/null || continue
  id -nG "$USER" | grep -qw "$g" || { warn "Not in '$g' group"; [[ $FIX -eq 1 ]] && $SUDO usermod -aG "$g" "$USER"; }
done

# 2. Detected serial devices
head "Connected serial devices"
mapfile -t devs < <(ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null)
if [[ ${#devs[@]} -gt 0 ]]; then printf '%s\n' "${devs[@]}" | while read -r d; do ok "$d"; done
else warn "No boards detected (plug one in via USB if expected)"; fi

# 3. Core tooling
head "Core tooling"
for t in python3 pip3 git curl; do
  command -v "$t" &>/dev/null && ok "$t" || { bad "$t missing"; ((ISSUES++)); }
done
command -v pip3 &>/dev/null || { [[ $FIX -eq 1 ]] && $SUDO apt-get install -y python3-pip; }

# 4. APT health
head "Package manager health"
if $SUDO dpkg --audit 2>/dev/null | grep -q .; then
  bad "dpkg reports half-configured packages"; ((ISSUES++))
  [[ $FIX -eq 1 ]] && { $SUDO dpkg --configure -a; $SUDO apt-get -f install -y; }
else ok "dpkg database is clean"; fi

# 5. Arduino CLI index
head "Arduino toolchain"
if command -v arduino-cli &>/dev/null; then
  ok "arduino-cli present"
  [[ $FIX -eq 1 ]] && arduino-cli core update-index >/dev/null 2>&1 && ok "board index updated"
else warn "arduino-cli not installed — run: horus-setup arduino"; fi

# 6. Connectivity
head "Connectivity"
if ping -c1 -W2 1.1.1.1 &>/dev/null; then ok "Internet reachable"
else warn "No internet — offline tutorials and local AI still work"; fi

# 7. Disk space
head "Disk space"
avail=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
if [[ "${avail:-0}" -ge 5 ]]; then ok "${avail}G free on /"; else warn "Low disk: ${avail}G free"; fi

echo ""
if [[ $ISSUES -eq 0 ]]; then
  echo -e "${GREEN}Your HORUS environment looks healthy. Happy building!${NC}"
else
  echo -e "${YELLOW}${ISSUES} issue(s) found.${NC} Re-run with ${CYAN}horus-doctor --fix${NC} to apply safe fixes."
fi
