#!/bin/bash
# ══════════════════════════════════════════════════════════════════════
#  HORUS OS — Main ISO Build Script
#  Builds a bootable HORUS OS ISO from Ubuntu 22.04 LTS minimal
#
#  Usage:  sudo ./build-iso.sh [--arch amd64|arm64] [--skip-packages]
#  Output: dist/horus-os-1.0.0-amd64.iso
#
#  Requirements: Ubuntu 22.04 build machine, ~8 GB free disk, sudo
#  Tested on:    Ubuntu 22.04 LTS x86_64
#  Created by:   Alaa Saber — HORUS OS Project
# ══════════════════════════════════════════════════════════════════════
set -eo pipefail

# ── Paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="${REPO_DIR}/build"
CHROOT_DIR="${BUILD_DIR}/chroot"
ISO_DIR="${BUILD_DIR}/iso"
OUTPUT_DIR="${REPO_DIR}/dist"

# ── Configuration ──────────────────────────────────────────────────────
HORUS_VERSION="1.0.0"
HORUS_CODENAME="Ra"
BASE_SUITE="jammy"
ARCH="${ARCH:-amd64}"
UBUNTU_MIRROR="http://archive.ubuntu.com/ubuntu/"
SKIP_PACKAGES="${SKIP_PACKAGES:-false}"
LIVE_USER="horus-user"
LIVE_PASS="horus2024"

# ── Parse Arguments ────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --arch) ARCH="$2"; shift 2;;
    --skip-packages) SKIP_PACKAGES=true; shift;;
    --output) OUTPUT_DIR="$2"; shift 2;;
    *) echo "Unknown argument: $1"; exit 1;;
  esac
done

# ── Terminal Colors ────────────────────────────────────────────────────
GOLD='\033[38;2;201;162;39m'
CYAN='\033[38;2;0;212;255m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

# ── Functions ──────────────────────────────────────────────────────────
banner() {
  echo -e "${GOLD}"
  cat << 'BANNER'
  ██╗  ██╗ ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗
  ██║  ██║██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔═══██╗██╔════╝
  ███████║██║   ██║██████╔╝██║   ██║███████╗    ██║   ██║███████╗
  ██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║    ██║   ██║╚════██║
  ██║  ██║╚██████╔╝██║  ██║╚██████╔╝███████║    ╚██████╔╝███████║
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚══════╝
BANNER
  echo -e "${NC}"
  echo -e "${GOLD}${BOLD}  HORUS OS Build System v${HORUS_VERSION} (${HORUS_CODENAME})${NC}"
  echo -e "${CYAN}  Embedded Intelligence Platform — Created by Alaa Saber${NC}"
  echo -e "${GOLD}  ────────────────────────────────────────────────────${NC}"
  echo ""
}

log_step()  { echo -e "\n${GOLD}${BOLD}══ $1 ══${NC}"; }
log_info()  { echo -e "${GREEN}  ✓${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}  ⚠${NC}  $1"; }
log_error() { echo -e "${RED}  ✗${NC}  $1"; exit 1; }
log_cmd()   { echo -e "${CYAN}  →${NC}  $1"; }

step_start() { echo -e "${CYAN}  ▶${NC}  $1..."; }

# ── Prerequisites ──────────────────────────────────────────────────────
check_prerequisites() {
  log_step "Checking Prerequisites"

  # Must run as root
  [[ $EUID -eq 0 ]] || log_error "Must run as root: sudo $0"

  # Check available disk space
  local available_gb
  available_gb=$(df -BG "${REPO_DIR}" | tail -1 | awk '{print $4}' | tr -d 'G')
  log_info "Available disk: ${available_gb} GB"
  [[ "${available_gb:-0}" -ge 4 ]] || log_warn "Low disk space: ${available_gb} GB (need 4+ GB)"

  # Required tools
  local tools=(debootstrap squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin mtools dosfstools)
  local missing=()
  for t in "${tools[@]}"; do
    dpkg -l "$t" &>/dev/null || missing+=("$t")
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    step_start "Installing missing build tools: ${missing[*]}"
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
      debootstrap squashfs-tools xorriso isolinux \
      grub-pc-bin grub-efi-amd64-bin mtools dosfstools \
      syslinux-utils wget curl git 2>/dev/null
    log_info "Build tools installed"
  fi

  log_info "All prerequisites satisfied (arch=${ARCH}, disk=${available_gb}GB free)"
}

# ── Bootstrap ──────────────────────────────────────────────────────────
bootstrap_base() {
  log_step "Bootstrapping Ubuntu ${BASE_SUITE} Base"

  mkdir -p "$CHROOT_DIR"

  if [[ -f "${CHROOT_DIR}/etc/os-release" ]]; then
    log_warn "Chroot already exists — skipping bootstrap. Delete ${CHROOT_DIR} to rebuild."
    return
  fi

  step_start "Running debootstrap (Ubuntu ${BASE_SUITE} ${ARCH})"
  debootstrap \
    --arch="$ARCH" \
    --include=systemd,systemd-sysv,sudo,locales,curl,wget,gnupg,ca-certificates \
    "$BASE_SUITE" \
    "$CHROOT_DIR" \
    "$UBUNTU_MIRROR"

  log_info "Ubuntu ${BASE_SUITE} base bootstrapped to ${CHROOT_DIR}"
}

# ── Chroot Setup ───────────────────────────────────────────────────────
prepare_chroot() {
  log_step "Preparing Chroot Environment"

  # Mount pseudo-filesystems
  for fs in dev dev/pts proc sys run; do
    mountpoint -q "${CHROOT_DIR}/${fs}" && continue
    if [[ $fs == "dev/pts" ]]; then
      mount devpts "${CHROOT_DIR}/dev/pts" -t devpts -o gid=5,mode=620
    elif [[ $fs == "proc" ]]; then
      mount proc "${CHROOT_DIR}/proc" -t proc
    elif [[ $fs == "sys" ]]; then
      mount sysfs "${CHROOT_DIR}/sys" -t sysfs
    elif [[ $fs == "run" ]]; then
      mount tmpfs "${CHROOT_DIR}/run" -t tmpfs -o mode=755,nosuid,nodev
    else
      mount --bind /dev "${CHROOT_DIR}/dev"
    fi
  done

  # Network access in chroot (resolv.conf is a symlink on Ubuntu 22.04)
  rm -f "${CHROOT_DIR}/etc/resolv.conf"
  cp -L /etc/resolv.conf "${CHROOT_DIR}/etc/resolv.conf" 2>/dev/null || \
    printf "nameserver 8.8.8.8\nnameserver 1.1.1.1\n" > "${CHROOT_DIR}/etc/resolv.conf"

  # APT sources
  cat > "${CHROOT_DIR}/etc/apt/sources.list" << EOF
deb ${UBUNTU_MIRROR} ${BASE_SUITE} main restricted universe multiverse
deb ${UBUNTU_MIRROR} ${BASE_SUITE}-updates main restricted universe multiverse
deb ${UBUNTU_MIRROR} ${BASE_SUITE}-security main restricted universe multiverse
deb ${UBUNTU_MIRROR} ${BASE_SUITE}-backports main restricted universe multiverse
EOF

  chroot "$CHROOT_DIR" apt-get update -qq
  log_info "Chroot prepared"
}

# ── Package Installation ───────────────────────────────────────────────
install_packages() {
  [[ "$SKIP_PACKAGES" == true ]] && { log_warn "Skipping package installation (--skip-packages)"; return; }
  log_step "Installing HORUS OS Packages"

  bash "${SCRIPT_DIR}/install-packages.sh" "$CHROOT_DIR"
  log_info "All packages installed"
}

# ── Branding ───────────────────────────────────────────────────────────
apply_branding() {
  log_step "Applying HORUS OS Branding"

  bash "${SCRIPT_DIR}/setup-branding.sh" "$CHROOT_DIR" "$REPO_DIR"
  log_info "Branding applied"
}

# ── Custom Apps ────────────────────────────────────────────────────────
# Build the React frontends on the HOST (Node only needed at build time).
# Falls back to each app's self-contained demo.html so the UI always works.
_build_frontends() {
  local node_major=0
  command -v node &>/dev/null && node_major=$(node -v 2>/dev/null | sed 's/v\([0-9]*\).*/\1/')

  for app in horus-control-center horus-ai-assistant horus-security-center; do
    local fe="${REPO_DIR}/apps/${app}/frontend"
    [[ -d "$fe" ]] || continue
    if command -v npm &>/dev/null && [[ "${node_major:-0}" -ge 18 ]]; then
      step_start "Building ${app} frontend (npm)"
      ( cd "$fe" && npm ci --no-audit --no-fund 2>/dev/null && npm run build 2>/dev/null ) \
        && log_info "${app}: React frontend built" \
        || log_warn "${app}: npm build failed — using demo.html"
    fi
    if [[ ! -f "${fe}/dist/index.html" && -f "${REPO_DIR}/apps/${app}/demo.html" ]]; then
      mkdir -p "${fe}/dist"
      cp "${REPO_DIR}/apps/${app}/demo.html" "${fe}/dist/index.html"
      log_info "${app}: using bundled demo.html as UI"
    fi
  done

  # Demo Mode ships as a standalone page
  local dm="${REPO_DIR}/apps/horus-demo-mode"
  if [[ -f "${dm}/index.html" ]]; then
    mkdir -p "${dm}/dist"; cp "${dm}/index.html" "${dm}/dist/index.html" 2>/dev/null || true
  fi
}

install_horus_apps() {
  log_step "Installing HORUS Custom Applications"

  local apps_dir="${REPO_DIR}/apps"
  local target_dir="${CHROOT_DIR}/opt/horus"

  _build_frontends

  mkdir -p "$target_dir"
  cp -r "${apps_dir}/." "${target_dir}/"

  # Drop dev-only files from the deployed copy (keep built dist/)
  find "$target_dir" -type d -name node_modules -prune -exec rm -rf {} + 2>/dev/null || true
  for d in "$target_dir"/*/frontend; do
    [[ -d "$d" ]] || continue
    rm -rf "$d/src" 2>/dev/null || true
    rm -f "$d"/*.config.* "$d"/package*.json "$d"/tsconfig*.json 2>/dev/null || true
  done

  # Project templates → /opt/horus/templates (used by Horus Robotics)
  if [[ -d "${REPO_DIR}/templates" ]]; then
    mkdir -p "${target_dir}/templates"
    cp -r "${REPO_DIR}/templates/." "${target_dir}/templates/"
    log_info "Project templates installed"
  fi

  # Calamares installer config + branding
  if [[ -d "${REPO_DIR}/configs/calamares" ]]; then
    mkdir -p "${CHROOT_DIR}/etc/calamares"
    cp -r "${REPO_DIR}/configs/calamares/." "${CHROOT_DIR}/etc/calamares/"
    local cbrand="${CHROOT_DIR}/etc/calamares/branding/horus"
    if command -v rsvg-convert &>/dev/null; then
      rsvg-convert -w 96  -h 96  "${REPO_DIR}/branding/logo/horus-logo.svg" -o "${cbrand}/logo.png" 2>/dev/null || true
      rsvg-convert -w 220 -h 220 "${REPO_DIR}/branding/logo/horus-logo.svg" -o "${cbrand}/welcome.png" 2>/dev/null || true
    fi
    log_info "Calamares installer configured"
  fi

  # Maker helper CLIs
  cp "${SCRIPT_DIR}/horus-setup.sh"  "${CHROOT_DIR}/usr/local/bin/horus-setup"  2>/dev/null || true
  cp "${SCRIPT_DIR}/horus-doctor.sh" "${CHROOT_DIR}/usr/local/bin/horus-doctor" 2>/dev/null || true
  chmod +x "${CHROOT_DIR}/usr/local/bin/horus-setup" "${CHROOT_DIR}/usr/local/bin/horus-doctor" 2>/dev/null || true

  # Python dependencies for the app backends
  step_start "Installing Python dependencies"
  chroot "$CHROOT_DIR" pip3 install --quiet \
    fastapi "uvicorn[standard]" psutil aiofiles python-multipart httpx pyserial 2>/dev/null \
    || log_warn "Some Python packages failed; continuing"
  chroot "$CHROOT_DIR" pip3 install --quiet ollama openai 2>/dev/null \
    || log_warn "AI packages failed; continuing (AI requires manual setup)"

  # Desktop entries + launch scripts
  mkdir -p "${CHROOT_DIR}/usr/share/applications"
  _create_desktop_entries
  _create_launch_scripts

  # Make HORUS Browser the default web browser
  chroot "$CHROOT_DIR" bash -c "
    update-alternatives --install /usr/bin/x-www-browser x-www-browser /usr/local/bin/horus-browser 200 2>/dev/null || true
    update-alternatives --set x-www-browser /usr/local/bin/horus-browser 2>/dev/null || true
  " 2>/dev/null || true

  # Copy systemd services
  if [[ -d "${REPO_DIR}/configs/systemd" ]]; then
    cp "${REPO_DIR}/configs/systemd/"*.service "${CHROOT_DIR}/etc/systemd/system/" 2>/dev/null || true
    chroot "$CHROOT_DIR" systemctl enable horus-control-center.service 2>/dev/null || true
  fi

  log_info "HORUS applications installed at /opt/horus"
}

_create_desktop_entries() {
  cat > "${CHROOT_DIR}/usr/share/applications/horus-control-center.desktop" << 'EOF'
[Desktop Entry]
Name=HORUS Control Center
Name[ar]=مركز تحكم حورس
Comment=Real-time system monitoring and control
Comment[ar]=مراقبة النظام والتحكم في الوقت الفعلي
Exec=/opt/horus/horus-control-center/launch.sh
Icon=/opt/horus/horus-control-center/icon.png
Terminal=false
Type=Application
Categories=System;Monitor;
Keywords=horus;system;monitor;cpu;ram;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-ai.desktop" << 'EOF'
[Desktop Entry]
Name=HORUS AI Assistant
Name[ar]=مساعد حورس الذكي
Comment=AI-powered OS and hardware assistant
Comment[ar]=مساعد ذكاء اصطناعي للنظام والمعدات
Exec=/opt/horus/horus-ai-assistant/launch.sh
Icon=/opt/horus/horus-ai-assistant/icon.png
Terminal=false
Type=Application
Categories=Education;Utility;
Keywords=horus;ai;assistant;chat;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-demo.desktop" << 'EOF'
[Desktop Entry]
Name=HORUS Demo Mode
Name[ar]=وضع عرض حورس
Comment=Competition demonstration mode
Comment[ar]=وضع العرض للمسابقات
Exec=/opt/horus/horus-demo-mode/launch.sh
Icon=/opt/horus/horus-demo-mode/icon.png
Terminal=false
Type=Application
Categories=Education;
Keywords=horus;demo;competition;presentation;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-security.desktop" << 'EOF'
[Desktop Entry]
Name=HORUS Security Center
Name[ar]=مركز أمان حورس
Comment=System security monitoring and privacy
Comment[ar]=مراقبة أمان النظام والخصوصية
Exec=/opt/horus/horus-security-center/launch.sh
Icon=/opt/horus/horus-security-center/icon.png
Terminal=false
Type=Application
Categories=System;Security;
Keywords=horus;security;firewall;privacy;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-browser.desktop" << 'EOF'
[Desktop Entry]
Name=HORUS Browser
Name[ar]=متصفح حورس
Comment=The native HORUS OS web browser
Comment[ar]=متصفح الويب الأصلي لنظام حورس
Exec=/usr/local/bin/horus-browser %U
Icon=web-browser
Terminal=false
Type=Application
Categories=Network;WebBrowser;
MimeType=text/html;x-scheme-handler/http;x-scheme-handler/https;
Keywords=horus;browser;web;internet;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-robotics.desktop" << 'EOF'
[Desktop Entry]
Name=HORUS Robotics
Name[ar]=حورس روبوتيكس
Comment=Arduino/ESP32 tools, project templates and wiring helper
Comment[ar]=أدوات أردوينو وESP32 وقوالب المشاريع ومساعد التوصيل
Exec=/opt/horus/horus-robotics/launch.sh
Icon=/opt/horus/horus-robotics/icon.png
Terminal=false
Type=Application
Categories=Development;Electronics;Education;
Keywords=horus;robotics;arduino;esp32;ros;maker;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-install.desktop" << 'EOF'
[Desktop Entry]
Name=Install HORUS OS
Name[ar]=تثبيت نظام حورس
Comment=Install HORUS OS to your hard disk
Comment[ar]=ثبّت نظام حورس على القرص الصلب
Exec=pkexec calamares
Icon=/opt/horus/horus-about/icon.png
Terminal=false
Type=Application
Categories=System;
Keywords=install;installer;calamares;horus;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-welcome.desktop" << 'EOF'
[Desktop Entry]
Name=Welcome to HORUS OS
Name[ar]=أهلًا بك في حورس
Comment=First-run tour and getting started
Comment[ar]=جولة البداية وكيفية الانطلاق
Exec=/opt/horus/horus-welcome/launch.sh
Icon=/opt/horus/horus-welcome/icon.png
Terminal=false
Type=Application
Categories=Education;Utility;
Keywords=horus;welcome;start;help;
StartupNotify=true
EOF

  cat > "${CHROOT_DIR}/usr/share/applications/horus-docs.desktop" << 'EOF'
[Desktop Entry]
Name=HORUS Docs
Name[ar]=توثيق حورس
Comment=Offline bilingual documentation and cheat-sheets
Comment[ar]=توثيق ومراجع سريعة بدون إنترنت (عربي/إنجليزي)
Exec=/opt/horus/horus-docs/launch.sh
Icon=/opt/horus/horus-docs/icon.png
Terminal=false
Type=Application
Categories=Education;Documentation;
Keywords=horus;docs;help;tutorial;reference;
StartupNotify=true
EOF

  # Run the welcome app once on first login (per user)
  mkdir -p "${CHROOT_DIR}/etc/skel/.config/autostart"
  cat > "${CHROOT_DIR}/etc/skel/.config/autostart/horus-welcome.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=HORUS Welcome
Exec=/opt/horus/horus-welcome/launch.sh --first-run
X-GNOME-Autostart-enabled=true
NoDisplay=true
EOF
}

_create_launch_scripts() {
  # Control Center launch
  cat > "${CHROOT_DIR}/opt/horus/horus-control-center/launch.sh" << 'EOF'
#!/bin/bash
cd /opt/horus/horus-control-center
# Start backend if not running
if ! curl -s http://127.0.0.1:8420/ &>/dev/null; then
  python3 backend/main.py &
  sleep 2
fi
# Open frontend
if command -v horus-browser &>/dev/null; then
  horus-browser --app=http://127.0.0.1:8420 --title="HORUS Control Center"
elif command -v chromium-browser &>/dev/null; then
  chromium-browser --app=http://127.0.0.1:8420 --window-size=1200,800 \
    --window-position=60,60 --disable-background-mode
else
  xdg-open http://127.0.0.1:8420
fi
EOF

  cat > "${CHROOT_DIR}/opt/horus/horus-ai-assistant/launch.sh" << 'EOF'
#!/bin/bash
cd /opt/horus/horus-ai-assistant
if ! curl -s http://127.0.0.1:8421/ &>/dev/null; then
  python3 main.py &
  sleep 2
fi
if command -v horus-browser &>/dev/null; then horus-browser --app=http://127.0.0.1:8421 --title="HORUS AI Assistant"
else xdg-open http://127.0.0.1:8421; fi
EOF

  cat > "${CHROOT_DIR}/opt/horus/horus-demo-mode/launch.sh" << 'EOF'
#!/bin/bash
cd /opt/horus/horus-demo-mode
if command -v chromium-browser &>/dev/null; then
  chromium-browser --kiosk --app=file:///opt/horus/horus-demo-mode/dist/index.html \
    --disable-background-mode --no-first-run
else
  xdg-open file:///opt/horus/horus-demo-mode/dist/index.html
fi
EOF

  cat > "${CHROOT_DIR}/opt/horus/horus-security-center/launch.sh" << 'EOF'
#!/bin/bash
cd /opt/horus/horus-security-center
if ! curl -s http://127.0.0.1:8422/ &>/dev/null; then
  python3 main.py &
  sleep 2
fi
if command -v horus-browser &>/dev/null; then horus-browser --app=http://127.0.0.1:8422 --title="HORUS Security Center"
else xdg-open http://127.0.0.1:8422; fi
EOF

  cat > "${CHROOT_DIR}/opt/horus/horus-robotics/launch.sh" << 'EOF'
#!/bin/bash
cd /opt/horus/horus-robotics
if ! curl -s http://127.0.0.1:8423/ &>/dev/null; then
  python3 main.py &
  sleep 2
fi
if command -v horus-browser &>/dev/null; then horus-browser --app=http://127.0.0.1:8423 --title="HORUS Robotics"
else xdg-open http://127.0.0.1:8423; fi
EOF

  cat > "${CHROOT_DIR}/opt/horus/horus-docs/launch.sh" << 'EOF'
#!/bin/bash
URL="file:///opt/horus/horus-docs/index.html"
if command -v horus-browser &>/dev/null; then horus-browser --app="$URL" --title="HORUS Docs"
else xdg-open "$URL"; fi
EOF

  cat > "${CHROOT_DIR}/opt/horus/horus-welcome/launch.sh" << 'EOF'
#!/bin/bash
FLAG="$HOME/.config/horus-welcome-shown"
[[ "${1:-}" == "--first-run" && -f "$FLAG" ]] && exit 0
mkdir -p "$HOME/.config"; touch "$FLAG"
URL="file:///opt/horus/horus-welcome/index.html"
if command -v horus-browser &>/dev/null; then horus-browser --app="$URL" --title="Welcome to HORUS OS"
else xdg-open "$URL"; fi
EOF

  # Make all launch scripts executable
  chmod +x "${CHROOT_DIR}/opt/horus/"*/launch.sh 2>/dev/null || true

  # Create convenient terminal commands
  cat > "${CHROOT_DIR}/usr/local/bin/horus-control" << 'EOF'
#!/bin/bash
/opt/horus/horus-control-center/launch.sh
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-ai" << 'EOF'
#!/bin/bash
/opt/horus/horus-ai-assistant/launch.sh
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-demo" << 'EOF'
#!/bin/bash
/opt/horus/horus-demo-mode/launch.sh
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-security" << 'EOF'
#!/bin/bash
/opt/horus/horus-security-center/launch.sh
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-robotics" << 'EOF'
#!/bin/bash
/opt/horus/horus-robotics/launch.sh
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-browser" << 'EOF'
#!/bin/bash
exec python3 /opt/horus/horus-browser/horus-browser.py "$@"
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-welcome" << 'EOF'
#!/bin/bash
/opt/horus/horus-welcome/launch.sh
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-docs" << 'EOF'
#!/bin/bash
/opt/horus/horus-docs/launch.sh
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-install" << 'EOF'
#!/bin/bash
# Install HORUS OS to disk (Calamares)
if command -v calamares &>/dev/null; then exec pkexec calamares
else echo "Installer not available in this build."; exit 1; fi
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-explain" << 'EOF'
#!/bin/bash
# Explain an error with HORUS AI.  Usage: horus-explain "<error>"  | or pipe output in
ERR="$*"
[[ -z "$ERR" && ! -t 0 ]] && ERR="$(cat)"
[[ -z "$ERR" ]] && { echo "Usage: horus-explain \"<error text>\"   (or: some-cmd 2>&1 | horus-explain)"; exit 1; }
curl -s http://127.0.0.1:8421/ >/dev/null 2>&1 || { ( cd /opt/horus/horus-ai-assistant && python3 main.py >/dev/null 2>&1 & ); sleep 2; }
PAYLOAD=$(python3 -c 'import json,sys; print(json.dumps({"error": sys.argv[1], "context": "general"}))' "$ERR")
curl -s -X POST http://127.0.0.1:8421/api/explain-error -H 'Content-Type: application/json' -d "$PAYLOAD" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print("\n"+d.get("explanation","(no answer)")+"\n  — HORUS AI ["+d.get("backend","?")+"]\n")' \
  2>/dev/null || echo "HORUS AI is unavailable. Try: horus-ai"
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-models" << 'EOF'
#!/bin/bash
# Manage local AI models.  Usage: horus-models [list] | horus-models pull <name>
curl -s http://127.0.0.1:8421/ >/dev/null 2>&1 || { ( cd /opt/horus/horus-ai-assistant && python3 main.py >/dev/null 2>&1 & ); sleep 2; }
case "${1:-list}" in
  pull)
    [[ -z "${2:-}" ]] && { echo "Usage: horus-models pull <name>"; exit 1; }
    P=$(python3 -c 'import json,sys; print(json.dumps({"name": sys.argv[1]}))' "$2")
    curl -s -X POST http://127.0.0.1:8421/api/models/pull -H 'Content-Type: application/json' -d "$P" \
      | python3 -c 'import json,sys; print(json.load(sys.stdin).get("message","started"))' ;;
  *)
    curl -s http://127.0.0.1:8421/api/models \
      | python3 -c 'import json,sys; d=json.load(sys.stdin); print("Ollama:", "online" if d.get("available") else d.get("hint","offline")); [print("  •", m["name"]) for m in d.get("models",[])]' ;;
esac
EOF
  cat > "${CHROOT_DIR}/usr/local/bin/horus-help" << 'HELPEOF'
#!/bin/bash
GOLD='\033[38;2;201;162;39m'
CYAN='\033[38;2;0;212;255m'
NC='\033[0m'
echo -e "${GOLD}HORUS OS — Available Commands${NC}"
echo -e "${CYAN}horus-control${NC}    Open HORUS Control Center"
echo -e "${CYAN}horus-ai${NC}         Open HORUS AI Assistant"
echo -e "${CYAN}horus-robotics${NC}   Open HORUS Robotics (boards, templates, wiring)"
echo -e "${CYAN}horus-security${NC}   Open HORUS Security Center"
echo -e "${CYAN}horus-demo${NC}       Launch HORUS Demo Mode"
echo -e "${CYAN}horus-browser${NC}    Open HORUS Browser"
echo -e "${CYAN}horus-setup${NC}      Install a toolchain (arduino, esp32, ros2, ...)"
echo -e "${CYAN}horus-doctor${NC}     Diagnose & fix your dev environment"
echo -e "${CYAN}horus-explain${NC}    Explain an error with HORUS AI"
echo -e "${CYAN}horus-models${NC}     List / pull local AI models (Ollama)"
echo -e "${CYAN}horus-docs${NC}       Offline docs & cheat-sheets"
echo -e "${CYAN}horus-install${NC}    Install HORUS OS to disk"
echo -e "${CYAN}horus-help${NC}       Show this help"
echo -e "${CYAN}fastfetch${NC}        System information"
HELPEOF
  chmod +x "${CHROOT_DIR}/usr/local/bin/horus-"* 2>/dev/null || true
}

# ── Services ───────────────────────────────────────────────────────────
configure_services() {
  log_step "Configuring System Services"

  bash "${SCRIPT_DIR}/setup-services.sh" "$CHROOT_DIR"
  log_info "Services configured"
}

# ── Live User ──────────────────────────────────────────────────────────
create_live_user() {
  log_step "Creating Live User"

  bash "${SCRIPT_DIR}/create-user.sh" "$CHROOT_DIR" "$LIVE_USER" "$LIVE_PASS" "$REPO_DIR"
  log_info "Live user created: ${LIVE_USER} / ${LIVE_PASS}"
}

# ── Chroot Cleanup ─────────────────────────────────────────────────────
cleanup_chroot() {
  log_info "Unmounting chroot pseudo-filesystems..."
  local mounts=(dev/pts proc sys dev run)
  for m in "${mounts[@]}"; do
    umount -lf "${CHROOT_DIR}/${m}" 2>/dev/null || true
  done
}

# ── ISO Build ──────────────────────────────────────────────────────────
build_iso() {
  log_step "Building HORUS OS ISO Image"

  mkdir -p "${ISO_DIR}"/{casper,boot/grub/themes,boot/grub/fonts,.disk,EFI/boot}

  # Kernel and initramfs
  step_start "Copying kernel and initramfs"
  VMLINUZ=$(find "${CHROOT_DIR}/boot" -name "vmlinuz-*" -type f 2>/dev/null | sort -V | tail -1)
  INITRD=$(find "${CHROOT_DIR}/boot"  -name "initrd.img-*" -type f 2>/dev/null | sort -V | tail -1)
  # If still missing, try installing kernel now
  if [[ -z "$VMLINUZ" ]]; then
    log_warn "No kernel found — installing linux-image-generic now"
    chroot "$CHROOT_DIR" env DEBIAN_FRONTEND=noninteractive apt-get install -y linux-image-generic 2>&1 || true
    VMLINUZ=$(find "${CHROOT_DIR}/boot" -name "vmlinuz-*" -type f 2>/dev/null | sort -V | tail -1)
    INITRD=$(find "${CHROOT_DIR}/boot"  -name "initrd.img-*" -type f 2>/dev/null | sort -V | tail -1)
  fi
  [[ -n "$VMLINUZ" ]] || log_error "No kernel found after install — aborting"
  [[ -n "$INITRD"  ]] || log_error "No initrd found after install — aborting"
  log_info "Kernel : $(basename "$VMLINUZ")"
  log_info "Initrd : $(basename "$INITRD")"
  cp "$VMLINUZ" "${ISO_DIR}/casper/vmlinuz"
  cp "$INITRD"  "${ISO_DIR}/casper/initrd"

  # Squashfs filesystem
  step_start "Creating squashfs (this takes 15–30 minutes)"
  mksquashfs "$CHROOT_DIR" "${ISO_DIR}/casper/filesystem.squashfs" \
    -comp xz -Xbcj x86 -b 1M -noappend \
    -e boot proc sys dev run tmp var/cache/apt var/lib/apt 2>&1 | tail -5

  # Filesystem size for installer
  printf "$(du -sx --block-size=1 "$CHROOT_DIR" | cut -f1)" \
    > "${ISO_DIR}/casper/filesystem.size"

  # Manifest
  chroot "$CHROOT_DIR" dpkg-query -W --showformat='${Package} ${Version}\n' \
    > "${ISO_DIR}/casper/filesystem.manifest"

  # GRUB config
  step_start "Writing GRUB configuration"
  cat > "${ISO_DIR}/boot/grub/grub.cfg" << EOF
set default=0
set timeout=8

# HORUS OS Theme
if [ -f /boot/grub/themes/horus/theme.txt ]; then
  set theme=/boot/grub/themes/horus/theme.txt
fi
set gfxmode=1920x1080x32,1280x720x32,auto
set gfxpayload=keep

insmod all_video
insmod gfxterm
insmod gfxmenu
terminal_output gfxterm

menuentry "HORUS OS ${HORUS_VERSION} — Start" --class horus --class os {
    set gfxpayload=keep
    linux   /casper/vmlinuz boot=casper quiet splash ---
    initrd  /casper/initrd
}

menuentry "HORUS OS — Safe Mode (nomodeset)" --class horus {
    linux   /casper/vmlinuz boot=casper nomodeset quiet splash ---
    initrd  /casper/initrd
}

menuentry "Install HORUS OS" --class install {
    linux   /casper/vmlinuz boot=casper only-ubiquity quiet splash ---
    initrd  /casper/initrd
}

menuentry "Check Disk for Defects" {
    linux   /casper/vmlinuz boot=casper integrity-check quiet splash ---
    initrd  /casper/initrd
}

menuentry "Boot from First Hard Disk" --class disk {
    set root=(hd0)
    chainloader +1
}
EOF

  # Copy GRUB theme
  if [[ -d "${CHROOT_DIR}/boot/grub/themes/horus" ]]; then
    cp -r "${CHROOT_DIR}/boot/grub/themes/horus" "${ISO_DIR}/boot/grub/themes/"
  fi

  # GRUB fonts
  [[ -f /usr/share/grub/unicode.pf2 ]] && \
    cp /usr/share/grub/unicode.pf2 "${ISO_DIR}/boot/grub/fonts/"

  # Disk info
  mkdir -p "${ISO_DIR}/.disk"
  echo "HORUS OS ${HORUS_VERSION} (${HORUS_CODENAME})" > "${ISO_DIR}/.disk/info"
  touch "${ISO_DIR}/.disk/base_installable"

  # ── BIOS El Torito boot image ──────────────────────────────────────────
  # grub-mkstandalone embeds ALL modules into one core image and hits the
  # 480 KB (0x78000) BIOS memory limit.  grub-mkimage builds a minimal core
  # with only iso9660+normal; every other module (linux, gfxterm, …) is
  # loaded at runtime from (cd)/boot/grub/i386-pc/ on the ISO itself.
  step_start "Building GRUB BIOS El Torito boot image"

  # Copy all i386-pc modules into the ISO so GRUB can load them after boot
  mkdir -p "${ISO_DIR}/boot/grub/i386-pc"
  cp /usr/lib/grub/i386-pc/*.mod "${ISO_DIR}/boot/grub/i386-pc/" 2>/dev/null || true
  cp /usr/lib/grub/i386-pc/*.lst "${ISO_DIR}/boot/grub/i386-pc/" 2>/dev/null || true

  # Build a minimal GRUB core image — only iso9660 and normal are needed;
  # the prefix (cd)/boot/grub tells GRUB where to find the rest on the ISO
  grub-mkimage \
    -d /usr/lib/grub/i386-pc \
    -o "${BUILD_DIR}/grub_core.img" \
    -O i386-pc \
    -p '(cd)/boot/grub' \
    iso9660 normal

  # Prepend the 512-byte El Torito CD-ROM bootstrap (cdboot.img) to make
  # the image bootable from an El Torito-aware BIOS / VM
  cat /usr/lib/grub/i386-pc/cdboot.img "${BUILD_DIR}/grub_core.img" \
    > "${ISO_DIR}/boot/grub/bios.img"
  log_info "BIOS boot  : bios.img ($(stat -c%s "${ISO_DIR}/boot/grub/bios.img") bytes)"

  # ── EFI boot image ─────────────────────────────────────────────────────
  # mtools (mmd/mcopy) fails on many CI runners — use loop mount instead.
  step_start "Building EFI boot image"
  grub-mkstandalone \
    --format=x86_64-efi \
    --output="${BUILD_DIR}/bootx64.efi" \
    --locales="" --fonts="" \
    "boot/grub/grub.cfg=${ISO_DIR}/boot/grub/grub.cfg" 2>/dev/null \
    || log_warn "grub-mkstandalone EFI failed — skipping UEFI boot"

  if [[ -f "${BUILD_DIR}/bootx64.efi" && -s "${BUILD_DIR}/bootx64.efi" ]]; then
    dd if=/dev/zero of="${BUILD_DIR}/efi.img" bs=1M count=20 2>/dev/null
    mkfs.fat -F 16 "${BUILD_DIR}/efi.img"
    mkdir -p "${BUILD_DIR}/efi_mnt"
    if mount -o loop "${BUILD_DIR}/efi.img" "${BUILD_DIR}/efi_mnt" 2>/dev/null; then
      mkdir -p "${BUILD_DIR}/efi_mnt/EFI/boot"
      cp "${BUILD_DIR}/bootx64.efi" "${BUILD_DIR}/efi_mnt/EFI/boot/"
      umount "${BUILD_DIR}/efi_mnt"
      cp "${BUILD_DIR}/efi.img" "${ISO_DIR}/EFI/boot/efi.img"
      log_info "EFI image  : created (UEFI enabled)"
    else
      log_warn "Loop mount failed — skipping EFI image"
    fi
    rmdir "${BUILD_DIR}/efi_mnt" 2>/dev/null || true
  else
    log_warn "bootx64.efi not built — BIOS-only ISO"
  fi

  # ── xorriso ────────────────────────────────────────────────────────────
  step_start "Running xorriso to create hybrid ISO"
  mkdir -p "$OUTPUT_DIR"
  local iso_name="horus-os-${HORUS_VERSION}-${ARCH}.iso"
  # ISO 9660 volume IDs must not contain dots — replace with underscores
  local volid="HORUS_OS_$(echo "$HORUS_VERSION" | tr '.' '_')"

  # Optional hybrid MBR — makes ISO USB-bootable (not just CD/VM)
  local mbr_args=()
  local grub_mbr="/usr/lib/grub/i386-pc/boot_hybrid.img"
  if [[ -f "$grub_mbr" ]]; then
    mbr_args=(--grub2-mbr "$grub_mbr")
    log_info "Hybrid MBR : enabled"
  else
    log_warn "boot_hybrid.img not found — ISO not USB hybrid-bootable"
  fi

  # Optional UEFI — only if efi.img was successfully created above
  local efi_args=()
  if [[ -f "${ISO_DIR}/EFI/boot/efi.img" && -s "${ISO_DIR}/EFI/boot/efi.img" ]]; then
    efi_args=(
      -eltorito-alt-boot
      -e EFI/boot/efi.img
      -no-emul-boot
      -append_partition 2 0xef "${ISO_DIR}/EFI/boot/efi.img"
    )
    log_info "UEFI boot  : enabled"
  else
    log_warn "EFI image absent — BIOS-only ISO (VMs boot fine without it)"
  fi

  # bios.img is now physically inside ISO_DIR — no graft points needed
  xorriso -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "$volid" \
    -eltorito-boot boot/grub/bios.img \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    --eltorito-catalog boot/grub/boot.cat \
    --grub2-boot-info \
    "${mbr_args[@]}" \
    "${efi_args[@]}" \
    -output "${OUTPUT_DIR}/${iso_name}" \
    "${ISO_DIR}"

  log_info "ISO created: ${OUTPUT_DIR}/${iso_name}"

  # Checksum
  sha256sum "${OUTPUT_DIR}/${iso_name}" | tee "${OUTPUT_DIR}/${iso_name}.sha256"

  # File size
  local size_mb
  size_mb=$(du -sm "${OUTPUT_DIR}/${iso_name}" | cut -f1)
  log_info "ISO size: ${size_mb} MB"
}

# ── Main ───────────────────────────────────────────────────────────────
main() {
  banner

  log_cmd "Architecture : ${ARCH}"
  log_cmd "Build dir    : ${BUILD_DIR}"
  log_cmd "Output       : ${OUTPUT_DIR}"
  log_cmd "Base suite   : Ubuntu ${BASE_SUITE}"
  echo ""

  check_prerequisites
  bootstrap_base
  prepare_chroot

  # Cleanup on any exit
  trap cleanup_chroot EXIT

  install_packages
  apply_branding
  install_horus_apps
  configure_services
  create_live_user

  cleanup_chroot
  trap - EXIT

  build_iso

  echo ""
  echo -e "${GOLD}${BOLD}══════════════════════════════════════════════════════${NC}"
  echo -e "${GOLD}${BOLD}  HORUS OS BUILD COMPLETE${NC}"
  echo -e "${GOLD}${BOLD}══════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ISO  : ${OUTPUT_DIR}/horus-os-${HORUS_VERSION}-${ARCH}.iso${NC}"
  echo -e "${CYAN}  Flash: sudo dd if=horus-os.iso of=/dev/sdX bs=4M status=progress${NC}"
  echo -e "${CYAN}  Or use Balena Etcher / Rufus (Windows)${NC}"
  echo ""
  echo -e "${GOLD}  HORUS OS — Intelligence Awakened${NC}"
  echo -e "${GOLD}  Created by Alaa Saber${NC}"
  echo ""
}

main "$@"
