#!/bin/bash
# HORUS OS — update manager (system packages via APT).
# Usage: horus-update [check|upgrade]
set -uo pipefail

GOLD='\033[38;2;201;162;39m'; GREEN='\033[0;32m'; NC='\033[0m'
SUDO=""; [[ $EUID -ne 0 ]] && SUDO="sudo"

case "${1:-upgrade}" in
  check)
    echo -e "${GOLD}Checking for updates…${NC}"
    $SUDO apt-get update -qq
    n=$(apt list --upgradable 2>/dev/null | grep -c upgradable || true)
    echo -e "${GOLD}${n}${NC} update(s) available."
    apt list --upgradable 2>/dev/null | tail -n +2 || true
    ;;
  upgrade|"")
    echo -e "${GOLD}Updating HORUS OS…${NC}"
    $SUDO apt-get update && $SUDO apt-get upgrade -y && $SUDO apt-get autoremove -y
    echo -e "${GREEN}HORUS OS is up to date.${NC}"
    ;;
  *)
    echo "Usage: horus-update [check|upgrade]"
    ;;
esac
