#!/bin/bash
# ══════════════════════════════════════════════════════════
#  HORUS EDU OS — Package Source for Distribution
#  Creates a clean zip of the source code for sharing
#  Usage: bash scripts/package-source.sh
# ══════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
VERSION="1.0.0"
OUT_DIR="${REPO_DIR}/dist"
PKG_NAME="horus-edu-os-${VERSION}-source"
PKG_DIR="${OUT_DIR}/${PKG_NAME}"
ZIP_OUT="${OUT_DIR}/${PKG_NAME}.zip"

GREEN='\033[0;32m'; CYAN='\033[38;2;0;212;255m'; GOLD='\033[38;2;201;162;39m'; NC='\033[0m'
ok()   { echo -e "${GREEN}  ✓${NC}  $1"; }
info() { echo -e "${CYAN}  →${NC}  $1"; }

echo -e "${GOLD}══ Horus Edu OS — Packaging Source ══${NC}"

mkdir -p "$PKG_DIR"

info "Copying source files..."

# Copy essential dirs (exclude build artifacts, node_modules, __pycache__)
for dir in apps configs scripts branding docs vmware; do
    [[ -d "${REPO_DIR}/${dir}" ]] && \
        rsync -a --exclude='__pycache__' --exclude='*.pyc' \
              --exclude='node_modules' --exclude='.venv' \
              --exclude='*.egg-info' \
              "${REPO_DIR}/${dir}/" "${PKG_DIR}/${dir}/"
done

# Copy root files
for f in README.md LICENSE .github; do
    [[ -e "${REPO_DIR}/${f}" ]] && cp -r "${REPO_DIR}/${f}" "${PKG_DIR}/"
done

# Copy build script with clear instructions at top
cp "${REPO_DIR}/scripts/build-iso.sh" "${PKG_DIR}/BUILD.sh"
chmod +x "${PKG_DIR}/BUILD.sh"

# Write a QUICKSTART
cat > "${PKG_DIR}/QUICKSTART.txt" << 'EOF'
╔══════════════════════════════════════════════════════════╗
║          HORUS EDU OS v1.0.0 — Source Package            ║
║           Horus University · التعلم بلا حدود             ║
╚══════════════════════════════════════════════════════════╝

BUILD THE ISO (requires Ubuntu 22.04):
  sudo bash BUILD.sh

WINDOWS QUICK TEST (no ISO needed):
  PowerShell (Admin): .\scripts\wsl-quickstart.ps1

VMWARE TEST:
  1. Build the ISO first (see above)
  2. Open vmware/horus-edu-os.vmx in VMware
  3. Place the ISO in the same folder

REQUIREMENTS:
  - Ubuntu 22.04 build machine
  - 10 GB free disk space
  - Internet connection (first build only)
  - sudo access

CONTACT: alaa00saber@gmail.com
EOF

info "Creating zip archive..."
cd "$OUT_DIR"
zip -r "${ZIP_OUT}" "${PKG_NAME}/" -x "*.DS_Store" -x "*/.git/*" > /dev/null

SIZE=$(du -sh "${ZIP_OUT}" | cut -f1)
ok "Package created: ${ZIP_OUT} (${SIZE})"
echo ""
echo -e "${GOLD}  Share this zip — recipients can build the ISO themselves${NC}"
