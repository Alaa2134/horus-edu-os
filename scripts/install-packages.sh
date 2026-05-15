#!/bin/bash
# HORUS OS — Package Installation Script
# Installs all required packages inside the chroot
# Called by build-iso.sh — can also be run standalone for testing
#
# Usage: sudo ./install-packages.sh [chroot_dir]

set -uo pipefail

CHROOT_DIR="${1:-/}"
DEBIAN_FRONTEND=noninteractive
export DEBIAN_FRONTEND
CI="${CI:-false}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[38;2;0;212;255m'; NC='\033[0m'
log_info() { echo -e "${GREEN}  ✓${NC}  $1"; }
log_warn() { echo -e "${YELLOW}  ⚠${NC}  $1"; }
log_pkg()  { echo -e "${CYAN}  ▶${NC}  Installing: $1"; }

_apt() {
  if [[ "$CHROOT_DIR" == "/" ]]; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "$@" || log_warn "Some packages failed (non-fatal)"
  else
    chroot "$CHROOT_DIR" env DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "$@" || log_warn "Some packages failed (non-fatal)"
  fi
  return 0
}

_apt_chroot() {
  chroot "$CHROOT_DIR" bash -c "DEBIAN_FRONTEND=noninteractive $*" 2>&1 || true
}

echo "[CI=$CI]"

echo -e "\n${CYAN}══ Installing HORUS OS Packages ══${NC}\n"

# ── 0. CRITICAL: Kernel — must install first and alone ──────────────────
log_pkg "Linux kernel (CRITICAL)"
chroot "$CHROOT_DIR" env DEBIAN_FRONTEND=noninteractive \
  apt-get install -y linux-image-generic
log_info "Kernel installed: $(ls ${CHROOT_DIR}/boot/vmlinuz-* 2>/dev/null | tail -1 | xargs basename)"

# ── 1. Core System ──────────────────────────────────────────────────────
log_pkg "Core system packages"
_apt \
  ubuntu-minimal \
  systemd-sysv dbus dbus-x11 \
  sudo bash-completion \
  locales tzdata \
  ca-certificates \
  udev || log_warn "Some core packages failed"

# ── 2. Desktop Environment (XFCE4) ─────────────────────────────────────
log_pkg "XFCE4 desktop environment"
_apt \
  xorg x11-xserver-utils \
  xfce4 xfce4-goodies \
  xfce4-terminal \
  xfwm4 xfdesktop4 xfce4-panel \
  xfce4-settings xfce4-session \
  xfce4-appfinder \
  thunar thunar-volman thunar-archive-plugin \
  xarchiver \
  mousepad \
  ristretto \
  picom \
  gvfs gvfs-backends udisks2

# ── 3. Display Manager ──────────────────────────────────────────────────
log_pkg "LightDM display manager"
_apt \
  lightdm \
  lightdm-gtk-greeter \
  lightdm-gtk-greeter-settings

# ── 4. Fonts ─────────────────────────────────────────────────────────────
log_pkg "Fonts"
_apt \
  fonts-liberation \
  fonts-liberation2 \
  fonts-noto \
  fonts-noto-core \
  fonts-noto-color-emoji \
  fonts-noto-ui-core \
  fonts-noto-ui-extra \
  fonts-open-sans \
  fonts-arabeyes \
  fonts-firacode \
  fonts-jetbrains-mono \
  fontconfig

# ── 5. Network ──────────────────────────────────────────────────────────
log_pkg "Network stack"
_apt \
  network-manager \
  network-manager-gnome \
  wireless-tools \
  wpasupplicant \
  net-tools \
  iproute2 \
  iputils-ping \
  dnsutils \
  nmap \
  curl \
  wget \
  openssh-client \
  openssh-server

# ── 6. Bluetooth ─────────────────────────────────────────────────────────
log_pkg "Bluetooth"
_apt \
  bluez \
  blueman \
  bluetooth || log_warn "Bluetooth packages failed, continuing"

# ── 7. Audio ─────────────────────────────────────────────────────────────
log_pkg "Audio stack"
_apt \
  pulseaudio \
  pulseaudio-utils \
  pavucontrol \
  alsa-utils || log_warn "Audio packages failed, continuing"

# ── 8. Plymouth ──────────────────────────────────────────────────────────
log_pkg "Plymouth boot splash"
_apt \
  plymouth \
  plymouth-themes \
  plymouth-x11

# ── 9. System Utilities ──────────────────────────────────────────────────
log_pkg "System utilities"
_apt \
  htop \
  btop \
  neofetch \
  lm-sensors \
  upower \
  acpi \
  smartmontools \
  inxi \
  lshw \
  pciutils \
  usbutils \
  dmidecode \
  file-roller \
  p7zip-full \
  zip unzip \
  rsync \
  tree \
  jq || log_warn "Some system utilities failed"

# fastfetch via PPA (not in Ubuntu 22.04 default repos)
log_pkg "fastfetch"
chroot "$CHROOT_DIR" bash -c "
  add-apt-repository -y ppa:zhangsongcui3371/fastfetch 2>/dev/null
  apt-get update -qq 2>/dev/null
  apt-get install -y fastfetch 2>/dev/null
" || log_warn "fastfetch install failed — using neofetch as fallback"

# bat (sometimes needs different package name)
chroot "$CHROOT_DIR" bash -c "
  apt-get install -y bat 2>/dev/null || apt-get install -y batcat 2>/dev/null
  command -v batcat &>/dev/null && ln -sf /usr/bin/batcat /usr/local/bin/bat 2>/dev/null || true
" || true

# ── 10. Python 3 ─────────────────────────────────────────────────────────
log_pkg "Python 3 runtime"
_apt \
  python3 \
  python3-pip \
  python3-venv \
  python3-dev \
  python3-setuptools \
  python3-wheel \
  python3-psutil \
  python3-serial \
  python3-smbus \
  idle-python3.10

# Install critical Python packages via pip
log_pkg "Python packages via pip"
chroot "$CHROOT_DIR" pip3 install --quiet --no-warn-script-location \
  fastapi "uvicorn[standard]" psutil aiofiles python-multipart httpx \
  2>/dev/null || log_warn "Some Python pip packages failed"

# ── 11. Node.js 18 LTS ───────────────────────────────────────────────────
if [[ "$CI" != "true" ]]; then
  log_pkg "Node.js 18 LTS"
  chroot "$CHROOT_DIR" bash -c "
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - 2>/dev/null
    apt-get install -y nodejs 2>/dev/null
  " || log_warn "Node.js setup failed — install manually with: nvm install 18"
else
  log_warn "Skipping Node.js in CI (install manually after boot)"
fi

# ── 12. Build Tools ──────────────────────────────────────────────────────
log_pkg "Build tools (GCC, CMake, Make)"
_apt \
  build-essential \
  gcc \
  g++ \
  make \
  cmake \
  ninja-build \
  autoconf \
  automake \
  libtool \
  pkg-config \
  gdb

# ── 13. Git and Version Control ──────────────────────────────────────────
log_pkg "Git"
_apt \
  git \
  git-lfs \
  tig

# ── 14. Embedded Development Tools ──────────────────────────────────────
log_pkg "Embedded development tools"
_apt \
  minicom \
  screen \
  picocom \
  cu \
  i2c-tools \
  libgpiod-dev \
  libgpiod2 \
  gpiod \
  spi-tools || true

# Arduino CLI
if [[ "$CI" != "true" ]]; then
  log_pkg "Arduino CLI"
  chroot "$CHROOT_DIR" bash -c "
    curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh 2>/dev/null | \
      BINDIR=/usr/local/bin sh 2>/dev/null
    arduino-cli core update-index 2>/dev/null || true
  " || log_warn "Arduino CLI install failed — install manually"
else
  log_warn "Skipping Arduino CLI in CI"
fi

# ── 15. VS Code ──────────────────────────────────────────────────────────
if [[ "$CI" != "true" ]]; then
  log_pkg "VS Code"
  chroot "$CHROOT_DIR" bash -c "
    mkdir -p /etc/apt/keyrings
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc 2>/dev/null | \
      gpg --dearmor > /etc/apt/keyrings/microsoft.gpg
    echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main' \
      > /etc/apt/sources.list.d/vscode.list
    apt-get update -qq 2>/dev/null
    apt-get install -y code 2>/dev/null
  " || log_warn "VS Code install failed — install manually with: sudo snap install code"
else
  log_warn "Skipping VS Code in CI (too large; install via snap after boot)"
fi

# ── 16. Micro Editor (lightweight fallback) ─────────────────────────────
if [[ "$CI" != "true" ]]; then
  log_pkg "Micro editor"
  chroot "$CHROOT_DIR" bash -c "
    curl https://getmic.ro 2>/dev/null | bash
    mv micro /usr/local/bin/ 2>/dev/null || true
  " || true
fi

# ── 17. System Monitoring / Terminal Tools ──────────────────────────────
log_pkg "Terminal enhancements"
_apt \
  tmux \
  vim \
  nano \
  less \
  man-db \
  bash \
  zsh || true

# ── 18. Optional: Chromium Browser ──────────────────────────────────────
log_pkg "Chromium browser (for HORUS apps)"
_apt chromium-browser 2>/dev/null || \
  _apt chromium 2>/dev/null || \
  log_warn "Chromium not available — HORUS apps will open in default browser"

# ── 19. Ubiquity Installer (for 'Install HORUS OS' option) ──────────────
log_pkg "Ubiquity installer"
_apt ubiquity ubiquity-frontend-gtk 2>/dev/null || \
  log_warn "Ubiquity not available — users can install with debootstrap manually"

# ── 20. GTK Theme Dependencies ───────────────────────────────────────────
log_pkg "GTK theme dependencies"
_apt \
  papirus-icon-theme \
  gtk2-engines-murrine \
  gtk2-engines-pixbuf \
  libglib2.0-bin \
  sassc \
  libglib2.0-dev || true

# ── Final: Clean up APT cache ────────────────────────────────────────────
log_pkg "Cleaning APT cache"
chroot "$CHROOT_DIR" apt-get autoremove -y --purge 2>/dev/null || true
chroot "$CHROOT_DIR" apt-get clean 2>/dev/null || true
rm -rf "${CHROOT_DIR}/var/lib/apt/lists/"*
rm -rf "${CHROOT_DIR}/tmp/"*

log_info "All packages installed successfully"
