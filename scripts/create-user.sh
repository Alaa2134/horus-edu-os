#!/bin/bash
# HORUS OS — User Creation Script
# Creates the default live/demo user and applies HORUS configuration
#
# Usage: sudo ./create-user.sh [chroot_dir] [username] [password] [repo_dir]

set -euo pipefail

CHROOT_DIR="${1:-/}"
USERNAME="${2:-horus-user}"
PASSWORD="${3:-horus2024}"
REPO_DIR="${4:-$(dirname "$(dirname "$(realpath "$0")")")}"

GREEN='\033[0;32m'; GOLD='\033[38;2;201;162;39m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info() { echo -e "${GREEN}  ✓${NC}  $1"; }
log_step() { echo -e "\n${GOLD}  ▶${NC}  $1"; }
log_warn() { echo -e "${YELLOW}  ⚠${NC}  $1"; }
_chroot() { chroot "$CHROOT_DIR" bash -c "$*"; }

# ── Create user ──────────────────────────────────────────────────────────
log_step "Creating user: ${USERNAME}"

_chroot "
  # Create user with full name HORUS User
  id ${USERNAME} &>/dev/null || useradd \
    -m \
    -s /bin/bash \
    -c 'HORUS User' \
    -G sudo,audio,video,plugdev,netdev,bluetooth,dialout,i2c \
    ${USERNAME}

  # Set password
  echo '${USERNAME}:${PASSWORD}' | chpasswd

  # Passwordless sudo for demo convenience
  echo '${USERNAME} ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/${USERNAME}
  chmod 440 /etc/sudoers.d/${USERNAME}
"
log_info "User ${USERNAME} created with password: ${PASSWORD}"

# ── Apply HORUS config to user home ──────────────────────────────────────
log_step "Applying HORUS configuration to user home"
HOME_DIR="${CHROOT_DIR}/home/${USERNAME}"

# Bash config
cat > "${HOME_DIR}/.bashrc" << 'BASHRC'
# HORUS OS .bashrc

# History
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoredups:erasedups

# Aliases
alias ll='ls -alh --color=auto'
alias la='ls -A --color=auto'
alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'
alias df='df -h'
alias du='du -h'
alias free='free -h'
alias cpu='cat /proc/cpuinfo | grep "model name" | head -1'
alias temp='sensors 2>/dev/null | grep -E "Core|Tdie|edge" || echo "Run: sudo sensors-detect"'
alias myip='hostname -I | awk "{print \$1}"'
alias ports='ss -tuln'
alias update='sudo apt update && sudo apt upgrade -y'
alias python='python3'
alias pip='pip3'

# HORUS shortcuts
alias horus='horus-help'
alias cc='horus-control'
alias ai='horus-ai'
alias demo='horus-demo'

# Show terminal welcome on first terminal open
if [[ -f ~/.horus-welcome.sh && "$SHLVL" == "1" && -z "$HORUS_WELCOMED" ]]; then
  export HORUS_WELCOMED=1
  bash ~/.horus-welcome.sh
fi

# Prompt
GOLD='\[\033[38;2;201;162;39m\]'
CYAN='\[\033[38;2;0;212;255m\]'
WHITE='\[\033[1;37m\]'
RESET='\[\033[0m\]'
PS1="${GOLD}[HORUS]${RESET} ${CYAN}\u${RESET}@${CYAN}\h${RESET}:${WHITE}\w${RESET}\$ "

# PATH additions
export PATH="/usr/local/bin:/opt/horus/scripts:$PATH"
BASHRC

# Copy fastfetch config
mkdir -p "${HOME_DIR}/.config/fastfetch"
[[ -f "${REPO_DIR}/configs/fastfetch/config.jsonc" ]] && \
  cp "${REPO_DIR}/configs/fastfetch/config.jsonc" \
     "${HOME_DIR}/.config/fastfetch/config.jsonc"

# Copy terminal welcome
[[ -f "${REPO_DIR}/configs/terminal-welcome.sh" ]] && \
  cp "${REPO_DIR}/configs/terminal-welcome.sh" \
     "${HOME_DIR}/.horus-welcome.sh" && \
  chmod +x "${HOME_DIR}/.horus-welcome.sh"

# Create Desktop directory with HORUS shortcuts
mkdir -p "${HOME_DIR}/Desktop"
for app in control-center ai demo security; do
  src="${CHROOT_DIR}/usr/share/applications/horus-${app}.desktop" 2>/dev/null || \
  src="${CHROOT_DIR}/usr/share/applications/horus-${app//control-center/control-center}.desktop"
  [[ -f "$src" ]] && cp "$src" "${HOME_DIR}/Desktop/" || true
done
chmod +x "${HOME_DIR}/Desktop/"*.desktop 2>/dev/null || true

# Create user project directories
mkdir -p "${HOME_DIR}/{Projects,Documents,Downloads,Scripts}"
mkdir -p "${HOME_DIR}/Projects/{arduino,python,embedded,notes}"

# Simple README in Projects
cat > "${HOME_DIR}/Projects/README.md" << 'README'
# HORUS OS — User Projects

Welcome to your HORUS OS workspace.

## Quick Start Commands
- `horus-help`     — list all HORUS commands
- `fastfetch`      — system information
- `horus-control`  — open Control Center
- `horus-ai`       — open AI Assistant
- `horus-demo`     — launch Demo Mode
- `python3`        — Python 3.11
- `arduino-cli`    — Arduino command line tool
- `i2cdetect -y 1` — scan I2C bus

## Project Structure
- `arduino/`   — Arduino sketches
- `python/`    — Python scripts
- `embedded/`  — Embedded system projects
- `notes/`     — Notes and documentation
README

# Fix permissions
_chroot "chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}"

log_info "User home configured with HORUS profile"

# ── Add user avatar ───────────────────────────────────────────────────────
# Create a simple avatar placeholder
mkdir -p "${CHROOT_DIR}/var/lib/AccountsService/icons"
# Will use default icon until a proper avatar is placed

log_info "User ${USERNAME} setup complete"
log_info "  Home: /home/${USERNAME}"
log_info "  Groups: sudo audio video plugdev netdev bluetooth dialout i2c"
log_info "  Shell: /bin/bash"
log_info "  Credentials: ${USERNAME} / ${PASSWORD}"
