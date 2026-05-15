#!/bin/bash
# HORUS OS — Terminal Welcome Banner
# Displays on first terminal open
# Source: ~/.horus-welcome.sh or /etc/profile.d/horus-welcome.sh

# ── Colors (true-color ANSI) ──────────────────────────────────────────
GOLD='\033[38;2;201;162;39m'
GOLD_LIGHT='\033[38;2;245;208;96m'
CYAN='\033[38;2;0;212;255m'
BLUE='\033[38;2;26;115;232m'
WHITE='\033[1;37m'
DIM='\033[2m'
DIMWHITE='\033[2;37m'
NC='\033[0m'
BOLD='\033[1m'
GREEN='\033[38;2;0;230;118m'
ORANGE='\033[38;2;255;152;0m'
RED='\033[38;2;244;67;54m'

# Only run in interactive shells
[[ $- != *i* ]] && return 0

# ── ASCII Logo ────────────────────────────────────────────────────────
echo ""
echo -e "${GOLD}"
cat << 'LOGO'
  ██╗  ██╗ ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗
  ██║  ██║██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔═══██╗██╔════╝
  ███████║██║   ██║██████╔╝██║   ██║███████╗    ██║   ██║███████╗
  ██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║    ██║   ██║╚════██║
  ██║  ██║╚██████╔╝██║  ██║╚██████╔╝███████║    ╚██████╔╝███████║
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚══════╝
LOGO
echo -e "${NC}"
echo -e "  ${CYAN}Intelligence Awakened${NC}  ${DIMWHITE}·${NC}  ${GOLD_LIGHT}نظام حورس — ذكاء مدمج للمستقبل${NC}"
echo -e "  ${DIM}─────────────────────────────────────────────────────────────${NC}"

# ── Gather system info ────────────────────────────────────────────────
OS_PRETTY=$(grep "PRETTY_NAME" /etc/os-release 2>/dev/null | cut -d'"' -f2 || echo "HORUS OS")
KERNEL=$(uname -r)
UPTIME_STR=$(uptime -p 2>/dev/null | sed 's/up //' || echo "unknown")
USER_HOST="${USER:-$(whoami)}@$(hostname)"
CPU_MODEL=$(grep "model name" /proc/cpuinfo 2>/dev/null | head -1 | cut -d':' -f2 | xargs || echo "Unknown CPU")
MEM_TOTAL=$(free -h 2>/dev/null | awk '/^Mem:/{print $2}' || echo "N/A")
MEM_USED=$(free -h 2>/dev/null | awk '/^Mem:/{print $3}' || echo "N/A")
MEM_PERCENT=$(free 2>/dev/null | awk '/^Mem:/{printf "%.0f%%", $3/$2*100}' || echo "?%")
DISK_INFO=$(df -h / 2>/dev/null | awk 'NR==2{printf "%s / %s (%s)", $3, $2, $5}' || echo "N/A")
IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "Not connected")

# CPU usage (quick sample)
CPU_USAGE=$(top -bn1 2>/dev/null | grep "Cpu(s)" | awk '{print 100 - $8"%" }' 2>/dev/null || echo "?%")

# Temperature (lm-sensors)
TEMP=$(sensors 2>/dev/null | grep -E "Package|Core 0|Tdie|edge|temp1" | head -1 | \
       awk '{print $2}' | tr -d '+' 2>/dev/null || echo "N/A")

# Battery (if available)
BATTERY=""
if command -v upower &>/dev/null; then
  BAT_DEV=$(upower -e 2>/dev/null | grep battery | head -1)
  if [[ -n "$BAT_DEV" ]]; then
    BAT_PCT=$(upower -i "$BAT_DEV" 2>/dev/null | grep percentage | awk '{print $2}')
    BAT_STATE=$(upower -i "$BAT_DEV" 2>/dev/null | grep state | awk '{print $2}')
    [[ -n "$BAT_PCT" ]] && BATTERY="${BAT_PCT} (${BAT_STATE})"
  fi
fi

# Color CPU percentage
if [[ "$CPU_USAGE" =~ ^([0-9]+) ]]; then
  cpu_num="${BASH_REMATCH[1]}"
  if   (( cpu_num < 50 )); then CPU_COLOR="$GREEN"
  elif (( cpu_num < 80 )); then CPU_COLOR="$ORANGE"
  else                           CPU_COLOR="$RED"
  fi
else CPU_COLOR="$WHITE"; fi

# Color memory percentage
if [[ "$MEM_PERCENT" =~ ^([0-9]+) ]]; then
  mem_num="${BASH_REMATCH[1]}"
  if   (( mem_num < 60 )); then MEM_COLOR="$GREEN"
  elif (( mem_num < 85 )); then MEM_COLOR="$ORANGE"
  else                           MEM_COLOR="$RED"
  fi
else MEM_COLOR="$WHITE"; fi

# ── Display info panel ────────────────────────────────────────────────
echo ""
printf "  ${GOLD}%-16s${NC} %s\n" "OS:"      "${OS_PRETTY}"
printf "  ${GOLD}%-16s${NC} %s\n" "Kernel:"  "${KERNEL}"
printf "  ${GOLD}%-16s${NC} %s\n" "User:"    "${USER_HOST}"
printf "  ${GOLD}%-16s${NC} %s\n" "Uptime:"  "${UPTIME_STR}"
echo ""
printf "  ${GOLD}%-16s${NC} %s\n" "CPU:"     "${CPU_MODEL}"
printf "  ${GOLD}%-16s${NC} ${CPU_COLOR}%s${NC}\n"  "CPU Load:"  "${CPU_USAGE}"
printf "  ${GOLD}%-16s${NC} ${MEM_COLOR}%s${NC} ${DIM}(%s used)${NC}\n" "Memory:" "${MEM_USED} / ${MEM_TOTAL}" "${MEM_PERCENT}"
printf "  ${GOLD}%-16s${NC} %s\n" "Disk (/):" "${DISK_INFO}"
[[ -n "$TEMP" && "$TEMP" != "N/A" ]] && \
  printf "  ${GOLD}%-16s${NC} %s\n" "Temperature:" "${TEMP}"
printf "  ${GOLD}%-16s${NC} %s\n" "IP Address:" "${IP_ADDR}"
[[ -n "$BATTERY" ]] && \
  printf "  ${GOLD}%-16s${NC} %s\n" "Battery:" "${BATTERY}"
echo ""

# ── Quick commands hint ───────────────────────────────────────────────
echo -e "  ${DIM}──────────────────────────────────────────────────${NC}"
printf "  ${DIM}%-22s${NC} %s\n" "horus-help"   "— Show all HORUS commands"
printf "  ${DIM}%-22s${NC} %s\n" "horus-control" "— Open Control Center"
printf "  ${DIM}%-22s${NC} %s\n" "horus-ai"      "— Open AI Assistant"
printf "  ${DIM}%-22s${NC} %s\n" "horus-demo"    "— Launch Demo Mode"
printf "  ${DIM}%-22s${NC} %s\n" "fastfetch"     "— Detailed system info"
echo ""
