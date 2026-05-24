#!/bin/bash
# HORUS OS — One-click toolchain installer
# Installs maker/AI/robotics toolchains on demand so the base image stays lean.
#
# Usage: horus-setup <toolchain>...   |   horus-setup list
set -uo pipefail

GOLD='\033[38;2;201;162;39m'; CYAN='\033[38;2;0;212;255m'
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info(){ echo -e "${GREEN}  ✓${NC} $1"; }
step(){ echo -e "\n${GOLD}▶ $1${NC}"; }
warn(){ echo -e "${YELLOW}  ⚠${NC} $1"; }
err(){  echo -e "${RED}  ✗${NC} $1"; }

SUDO=""; [[ $EUID -ne 0 ]] && SUDO="sudo"

usage(){
cat <<EOF
$(echo -e "${GOLD}HORUS Setup — one-click toolchains${NC}")

Usage: horus-setup <toolchain>...

  arduino     Arduino CLI + AVR core
  esp32       ESP32 core for Arduino CLI + esptool
  platformio  PlatformIO Core (pip)
  python-ai   numpy, opencv, scikit-learn, matplotlib, pandas
  pytorch     PyTorch (CPU build)
  node        Node.js 20 LTS (NodeSource)
  flutter     Flutter SDK (snap)
  docker      Docker engine + add you to the docker group
  ros2        ROS 2 Humble (desktop)
  web         Node.js + common web tooling
  list        Show this list

Examples:
  horus-setup arduino esp32
  horus-setup python-ai pytorch
EOF
}

apt_install(){ $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"; }

setup_arduino(){
  step "Arduino CLI + AVR core"
  if ! command -v arduino-cli &>/dev/null; then
    curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | $SUDO BINDIR=/usr/local/bin sh
  fi
  arduino-cli config init --overwrite >/dev/null 2>&1 || true
  arduino-cli core update-index && arduino-cli core install arduino:avr
  info "Arduino ready — try: horus-lab or arduino-cli board list"
}

setup_esp32(){
  step "ESP32 core"
  command -v arduino-cli &>/dev/null || setup_arduino
  arduino-cli config add board_manager.additional_urls \
    https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json 2>/dev/null || true
  arduino-cli core update-index && arduino-cli core install esp32:esp32
  pip3 install --user --quiet esptool 2>/dev/null || true
  info "ESP32 ready (fqbn esp32:esp32:esp32)"
}

setup_platformio(){ step "PlatformIO Core"; pip3 install --user --quiet -U platformio && info "pio installed"; }

setup_python_ai(){
  step "Python AI stack"
  apt_install python3-pip python3-venv
  pip3 install --user --quiet -U numpy pandas matplotlib scikit-learn opencv-python
  info "Python AI stack ready"
}

setup_pytorch(){ step "PyTorch (CPU)"; pip3 install --user --quiet torch torchvision --index-url https://download.pytorch.org/whl/cpu && info "PyTorch ready"; }

setup_node(){
  step "Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  apt_install nodejs && info "node $(node -v)"
}

setup_flutter(){
  step "Flutter SDK"
  if command -v snap &>/dev/null; then $SUDO snap install flutter --classic && info "Flutter via snap";
  else warn "snap not available — see https://docs.flutter.dev/get-started/install/linux"; fi
}

setup_docker(){
  step "Docker engine"
  apt_install docker.io
  $SUDO systemctl enable --now docker 2>/dev/null || true
  $SUDO usermod -aG docker "$USER" && info "Added $USER to docker group (re-login to apply)"
}

setup_ros2(){
  step "ROS 2 Humble (this is large)"
  apt_install software-properties-common curl gnupg lsb-release
  $SUDO add-apt-repository -y universe
  $SUDO curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
    -o /usr/share/keyrings/ros-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo ${UBUNTU_CODENAME:-jammy}) main" \
    | $SUDO tee /etc/apt/sources.list.d/ros2.list >/dev/null
  $SUDO apt-get update -qq && apt_install ros-humble-desktop python3-colcon-common-extensions
  info "ROS 2 ready — source /opt/ros/humble/setup.bash"
}

setup_web(){ setup_node; npm install -g create-vite 2>/dev/null || true; info "Web tooling ready"; }

[[ $# -eq 0 ]] && { usage; exit 0; }

for t in "$@"; do
  case "$t" in
    arduino) setup_arduino;; esp32) setup_esp32;; platformio) setup_platformio;;
    python-ai) setup_python_ai;; pytorch) setup_pytorch;; node) setup_node;;
    flutter) setup_flutter;; docker) setup_docker;; ros2) setup_ros2;; web) setup_web;;
    list|-h|--help) usage;;
    *) err "Unknown toolchain: $t"; usage; exit 1;;
  esac
done

echo -e "\n${CYAN}Done. Run 'horus-doctor' to verify your environment.${NC}"
