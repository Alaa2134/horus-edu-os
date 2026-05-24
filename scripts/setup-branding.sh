#!/bin/bash
# HORUS OS — Branding Setup Script
# Deploys all HORUS OS branding to the target rootfs
#
# Usage: sudo ./setup-branding.sh [chroot_dir] [repo_dir]

set -euo pipefail

CHROOT_DIR="${1:-/}"
REPO_DIR="${2:-$(dirname "$(dirname "$(realpath "$0")")")}"

GREEN='\033[0;32m'; GOLD='\033[38;2;201;162;39m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info() { echo -e "${GREEN}  ✓${NC}  $1"; }
log_step() { echo -e "\n${GOLD}  ▶${NC}  $1"; }
log_warn() { echo -e "${YELLOW}  ⚠${NC}  $1"; }

_chroot() { chroot "$CHROOT_DIR" bash -c "$*"; }

echo -e "\n${GOLD}══ Setting Up HORUS OS Branding ══${NC}\n"

# ── 1. OS Identity ───────────────────────────────────────────────────────
log_step "Writing OS identity"
cp "${REPO_DIR}/configs/os-release" "${CHROOT_DIR}/etc/os-release"
echo "horus-os" > "${CHROOT_DIR}/etc/hostname"
cat > "${CHROOT_DIR}/etc/hosts" << 'EOF'
127.0.0.1   localhost
127.0.1.1   horus-os
::1         localhost ip6-localhost ip6-loopback
ff02::1     ip6-allnodes
ff02::2     ip6-allrouters
EOF
log_info "OS identity set: HORUS OS 1.0.0"

# ── 2. Locale ────────────────────────────────────────────────────────────
log_step "Configuring locales"
cat > "${CHROOT_DIR}/etc/locale.gen" << 'EOF'
en_US.UTF-8 UTF-8
ar_SA.UTF-8 UTF-8
EOF
_chroot "locale-gen && update-locale LANG=en_US.UTF-8" || log_warn "locale-gen failed"
cat > "${CHROOT_DIR}/etc/environment" << 'EOF'
LANG=en_US.UTF-8
LANGUAGE=en_US:en
LC_ALL=en_US.UTF-8
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
EOF
log_info "Locales: en_US.UTF-8 + ar_SA.UTF-8"

# ── 3. Plymouth Boot Splash ──────────────────────────────────────────────
log_step "Installing Plymouth HORUS theme"
PLYMOUTH_THEME_DIR="${CHROOT_DIR}/usr/share/plymouth/themes/horus"
mkdir -p "$PLYMOUTH_THEME_DIR"

# Copy Plymouth files from repo
cp "${REPO_DIR}/branding/plymouth/horus.plymouth" "${PLYMOUTH_THEME_DIR}/"
cp "${REPO_DIR}/branding/plymouth/horus.script" "${PLYMOUTH_THEME_DIR}/"

# Convert SVG logo to PNG for Plymouth (if imagemagick or inkscape available)
if command -v inkscape &>/dev/null; then
  inkscape --export-type=png --export-width=200 \
    "${REPO_DIR}/branding/logo/horus-logo.svg" \
    -o "${PLYMOUTH_THEME_DIR}/horus-logo.png" 2>/dev/null && \
    log_info "Logo converted with inkscape"
elif command -v convert &>/dev/null; then
  convert -background none -resize 200x200 \
    "${REPO_DIR}/branding/logo/horus-logo.svg" \
    "${PLYMOUTH_THEME_DIR}/horus-logo.png" 2>/dev/null && \
    log_info "Logo converted with ImageMagick"
else
  # Create a minimal placeholder PNG (1px transparent) so Plymouth doesn't error
  printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82' \
    > "${PLYMOUTH_THEME_DIR}/horus-logo.png"
  log_warn "No image converter found; using placeholder logo PNG"
fi

# Generate a simple progress bar PNG (200x10 gold gradient placeholder)
cat "${PLYMOUTH_THEME_DIR}/horus-logo.png" > "${PLYMOUTH_THEME_DIR}/progress_bar.png" 2>/dev/null || true
cat "${PLYMOUTH_THEME_DIR}/horus-logo.png" > "${PLYMOUTH_THEME_DIR}/progress_box.png" 2>/dev/null || true

# Set as default Plymouth theme
_chroot "
  update-alternatives --install /usr/share/plymouth/themes/default.plymouth \
    default.plymouth /usr/share/plymouth/themes/horus/horus.plymouth 100 2>/dev/null || true
  update-alternatives --set default.plymouth \
    /usr/share/plymouth/themes/horus/horus.plymouth 2>/dev/null || true
  update-initramfs -u 2>/dev/null || true
" || log_warn "Plymouth update-initramfs failed (safe to ignore during build)"

log_info "Plymouth theme installed"

# ── 4. GRUB Theme ────────────────────────────────────────────────────────
log_step "Installing GRUB HORUS theme"
GRUB_THEME_DIR="${CHROOT_DIR}/boot/grub/themes/horus"
mkdir -p "$GRUB_THEME_DIR"
cp "${REPO_DIR}/branding/grub-theme/theme.txt" "$GRUB_THEME_DIR/"

# Copy GRUB font
mkdir -p "${CHROOT_DIR}/boot/grub/fonts"
[[ -f /usr/share/grub/unicode.pf2 ]] && \
  cp /usr/share/grub/unicode.pf2 "${CHROOT_DIR}/boot/grub/fonts/"

# GRUB default config
cat > "${CHROOT_DIR}/etc/default/grub" << 'EOF'
GRUB_DEFAULT=0
GRUB_TIMEOUT=8
GRUB_DISTRIBUTOR="HORUS OS"
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
GRUB_CMDLINE_LINUX=""
GRUB_THEME="/boot/grub/themes/horus/theme.txt"
GRUB_GFXMODE="1920x1080x32,1280x720x32,auto"
GRUB_GFXPAYLOAD_LINUX="keep"
GRUB_RECORDFAIL_TIMEOUT=5
EOF

_chroot "update-grub 2>/dev/null || true"
log_info "GRUB theme installed"

# ── 5. Desktop Wallpapers ────────────────────────────────────────────────
log_step "Deploying wallpapers"
# GNOME reads backgrounds from /usr/share/backgrounds; keep a /usr/share/horus
# copy too for legacy references.
BG_DIR="${CHROOT_DIR}/usr/share/backgrounds/horus"
WALLPAPER_DIR="${CHROOT_DIR}/usr/share/horus/wallpapers"
mkdir -p "$BG_DIR" "$WALLPAPER_DIR"

# Copy any prebuilt wallpaper assets from the repo
[[ -d "${REPO_DIR}/branding/wallpapers" ]] && \
  cp -r "${REPO_DIR}/branding/wallpapers/." "$WALLPAPER_DIR/" 2>/dev/null || true

WALL_SVG="${REPO_DIR}/branding/wallpapers/horus-pyramids.svg"

# Render the vector wallpaper to a high-resolution PNG (3840x2160 for crispness)
render_wallpaper() {
  local out="$1"
  if command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w 3840 -h 2160 "$WALL_SVG" -o "$out" 2>/dev/null && return 0
  fi
  if command -v inkscape &>/dev/null; then
    inkscape "$WALL_SVG" --export-type=png --export-width=3840 --export-height=2160 \
      -o "$out" 2>/dev/null && return 0
  fi
  if command -v convert &>/dev/null; then
    convert -background none -density 200 "$WALL_SVG" -resize 3840x2160 "$out" 2>/dev/null && return 0
  fi
  return 1
}

if [[ -f "$WALL_SVG" ]]; then
  if render_wallpaper "${BG_DIR}/horus-pyramids.png"; then
    cp "${BG_DIR}/horus-pyramids.png" "${WALLPAPER_DIR}/desktop.png" 2>/dev/null || true
    cp "${WALL_SVG}" "${BG_DIR}/horus-pyramids.svg" 2>/dev/null || true
    log_info "Wallpaper rendered: horus-pyramids.png (3840x2160)"
  else
    # No rasteriser available — ship the SVG and point GNOME at it directly
    cp "$WALL_SVG" "${BG_DIR}/horus-pyramids.svg"
    log_warn "No SVG rasteriser found — shipping vector wallpaper only"
  fi
else
  log_warn "Wallpaper SVG not found at ${WALL_SVG}"
fi

# GNOME background XML so the wallpaper appears in Settings → Appearance
mkdir -p "${CHROOT_DIR}/usr/share/gnome-background-properties"
cat > "${CHROOT_DIR}/usr/share/gnome-background-properties/horus.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE wallpapers SYSTEM "gnome-wp-list.dtd">
<wallpapers>
  <wallpaper deleted="false">
    <name>HORUS Pyramids</name>
    <filename>/usr/share/backgrounds/horus/horus-pyramids.png</filename>
    <filename-dark>/usr/share/backgrounds/horus/horus-pyramids.png</filename-dark>
    <options>zoom</options>
    <pcolor>#0a0a0f</pcolor>
    <scolor>#12121a</scolor>
  </wallpaper>
</wallpapers>
EOF

log_info "Wallpapers deployed"

# ── 6. GDM3 Login Screen ──────────────────────────────────────────────────
log_step "Configuring GDM3 login screen"
mkdir -p "${CHROOT_DIR}/etc/gdm3"

# Live session boots straight to the desktop (autologin). On an installed
# system the OEM/first-boot flow takes over and this is harmless.
cat > "${CHROOT_DIR}/etc/gdm3/custom.conf" << EOF
# HORUS OS — GDM configuration
[daemon]
WaylandEnable=true
AutomaticLoginEnable=true
AutomaticLogin=horus

[security]

[xdmcp]

[chooser]

[debug]
EOF

# GDM greeter (login screen) dark theme + clock via dconf
mkdir -p "${CHROOT_DIR}/etc/dconf/db/gdm.d"
cat > "${CHROOT_DIR}/etc/dconf/db/gdm.d/00-horus-login" << 'EOF'
[org/gnome/desktop/interface]
color-scheme='prefer-dark'
gtk-theme='Yaru-dark'
icon-theme='Yaru-dark'
cursor-theme='Yaru'
clock-show-weekday=true

[org/gnome/login-screen]
logo='/usr/share/backgrounds/horus/horus-logo.png'
banner-message-enable=true
banner-message-text='HORUS OS — Intelligence Awakened'
disable-user-list=false
EOF

# Render the logo for the GDM greeter (small, transparent PNG)
if command -v rsvg-convert &>/dev/null; then
  rsvg-convert -w 96 -h 96 "${REPO_DIR}/branding/logo/horus-logo.svg" \
    -o "${BG_DIR}/horus-logo.png" 2>/dev/null || true
elif command -v inkscape &>/dev/null; then
  inkscape "${REPO_DIR}/branding/logo/horus-logo.svg" --export-type=png \
    --export-width=96 -o "${BG_DIR}/horus-logo.png" 2>/dev/null || true
fi

# Skip Ubuntu's initial-setup wizard on first login
mkdir -p "${CHROOT_DIR}/etc/skel/.config"
touch "${CHROOT_DIR}/etc/skel/.config/gnome-initial-setup-done"

log_info "GDM3 configured (Wayland, dark greeter, live autologin → horus)"

# ── 7. Fastfetch + Terminal Welcome ──────────────────────────────────────
log_step "Configuring terminal experience"
mkdir -p "${CHROOT_DIR}/etc/skel/.config/fastfetch"
[[ -f "${REPO_DIR}/configs/fastfetch/config.jsonc" ]] && \
  cp "${REPO_DIR}/configs/fastfetch/config.jsonc" \
     "${CHROOT_DIR}/etc/skel/.config/fastfetch/config.jsonc"

# Terminal welcome in /etc/skel
[[ -f "${REPO_DIR}/configs/terminal-welcome.sh" ]] && \
  cp "${REPO_DIR}/configs/terminal-welcome.sh" \
     "${CHROOT_DIR}/etc/skel/.horus-welcome.sh"

# HORUS ASCII art for fastfetch
mkdir -p "${CHROOT_DIR}/usr/share/horus"
cat > "${CHROOT_DIR}/usr/share/horus/ascii-logo.txt" << 'ASCIIEOF'
${c1}   ██╗  ██╗${c2} ██████╗ ██████╗ ██╗   ██╗███████╗
${c1}   ██║  ██║${c2}██╔═══██╗██╔══██╗██║   ██║██╔════╝
${c1}   ███████║${c2}██║   ██║██████╔╝██║   ██║███████╗
${c1}   ██╔══██║${c2}██║   ██║██╔══██╗██║   ██║╚════██║
${c1}   ██║  ██║${c2}╚██████╔╝██║  ██║╚██████╔╝███████║
${c1}   ╚═╝  ╚═╝${c2} ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
${c1}      ██████╗ ███████╗
${c1}     ██╔═══██╗██╔════╝
${c1}     ██║   ██║███████╗
${c1}     ██║   ██║╚════██║
${c1}     ╚██████╔╝███████║
${c1}      ╚═════╝ ╚══════╝
${c2}  Intelligence Awakened  ·  v1.0.0
ASCIIEOF

log_info "Terminal experience configured"

# ── 8. GTK Theme (Yaru-dark) ──────────────────────────────────────────────
log_step "Setting GTK theme"
mkdir -p "${CHROOT_DIR}/etc/skel/.config/gtk-3.0" \
         "${CHROOT_DIR}/etc/skel/.config/gtk-4.0"
cat > "${CHROOT_DIR}/etc/skel/.config/gtk-3.0/settings.ini" << 'EOF'
[Settings]
gtk-theme-name=Yaru-dark
gtk-icon-theme-name=Yaru-dark
gtk-font-name=Ubuntu 11
gtk-cursor-theme-name=Yaru
gtk-cursor-theme-size=24
gtk-application-prefer-dark-theme=1
gtk-enable-event-sounds=0
gtk-enable-input-feedback-sounds=0
gtk-xft-antialias=1
gtk-xft-hinting=1
gtk-xft-hintstyle=slight
gtk-xft-rgba=rgb
EOF
cp "${CHROOT_DIR}/etc/skel/.config/gtk-3.0/settings.ini" \
   "${CHROOT_DIR}/etc/skel/.config/gtk-4.0/settings.ini"
log_info "GTK theme configured (Yaru-dark)"

# ── 9. GNOME System Defaults (dconf) ──────────────────────────────────────
log_step "Applying GNOME defaults via dconf"
mkdir -p "${CHROOT_DIR}/etc/dconf/db/local.d" \
         "${CHROOT_DIR}/etc/dconf/profile"

# dconf profile: user settings layered over the system 'local' database
cat > "${CHROOT_DIR}/etc/dconf/profile/user" << 'EOF'
user-db:user
system-db:local
EOF

# System-wide HORUS defaults (dark theme, wallpaper, dock, fonts, favourites)
if [[ -f "${REPO_DIR}/configs/gnome/00-horus-defaults" ]]; then
  cp "${REPO_DIR}/configs/gnome/00-horus-defaults" \
     "${CHROOT_DIR}/etc/dconf/db/local.d/00-horus-defaults"
else
  log_warn "configs/gnome/00-horus-defaults not found — GNOME defaults skipped"
fi

# Compile the dconf databases (local + gdm)
_chroot "dconf update 2>/dev/null || true"
log_info "GNOME defaults applied (Yaru-dark · bottom dock · pyramid wallpaper)"

echo -e "\n${GOLD}  HORUS OS branding setup complete${NC}\n"
