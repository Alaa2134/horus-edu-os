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
WALLPAPER_DIR="${CHROOT_DIR}/usr/share/horus/wallpapers"
mkdir -p "$WALLPAPER_DIR"

# Copy wallpapers from repo if they exist
[[ -d "${REPO_DIR}/branding/wallpapers" ]] && \
  cp -r "${REPO_DIR}/branding/wallpapers/." "$WALLPAPER_DIR/" 2>/dev/null || true

# Create a fallback SVG wallpaper if no PNG wallpapers exist
if [[ ! -f "${WALLPAPER_DIR}/desktop.png" ]]; then
  cat > "${WALLPAPER_DIR}/desktop.svg" << 'WALLEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#12121a"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <!-- Grid lines -->
  <g stroke="#c9a227" stroke-width="0.3" opacity="0.08">
    <line x1="0" y1="108" x2="1920" y2="108"/><line x1="0" y1="216" x2="1920" y2="216"/>
    <line x1="0" y1="324" x2="1920" y2="324"/><line x1="0" y1="432" x2="1920" y2="432"/>
    <line x1="0" y1="540" x2="1920" y2="540"/><line x1="0" y1="648" x2="1920" y2="648"/>
    <line x1="0" y1="756" x2="1920" y2="756"/><line x1="0" y1="864" x2="1920" y2="864"/>
    <line x1="0" y1="972" x2="1920" y2="972"/>
    <line x1="192" y1="0" x2="192" y2="1080"/><line x1="384" y1="0" x2="384" y2="1080"/>
    <line x1="576" y1="0" x2="576" y2="1080"/><line x1="768" y1="0" x2="768" y2="1080"/>
    <line x1="960" y1="0" x2="960" y2="1080"/><line x1="1152" y1="0" x2="1152" y2="1080"/>
    <line x1="1344" y1="0" x2="1344" y2="1080"/><line x1="1536" y1="0" x2="1536" y2="1080"/>
    <line x1="1728" y1="0" x2="1728" y2="1080"/>
  </g>
  <!-- Center eye mark -->
  <path d="M760,540 Q960,440 1160,540 Q960,640 760,540 Z" fill="none" stroke="#c9a227" stroke-width="1.5" opacity="0.25" filter="url(#glow)"/>
  <circle cx="960" cy="540" r="40" fill="none" stroke="#c9a227" stroke-width="1.5" opacity="0.25" filter="url(#glow)"/>
  <circle cx="960" cy="540" r="12" fill="#c9a227" opacity="0.15"/>
  <!-- Horizontal glow line -->
  <line x1="0" y1="540" x2="1920" y2="540" stroke="#00d4ff" stroke-width="0.5" opacity="0.12"/>
  <!-- HORUS text (very subtle watermark) -->
  <text x="960" y="555" font-family="serif" font-size="22" font-weight="700" fill="#c9a227" opacity="0.08" text-anchor="middle" letter-spacing="30">HORUS OS</text>
</svg>
WALLEOF

  # Convert SVG to PNG if possible
  if command -v inkscape &>/dev/null; then
    inkscape "${WALLPAPER_DIR}/desktop.svg" --export-type=png \
      --export-width=1920 --export-height=1080 \
      -o "${WALLPAPER_DIR}/desktop.png" 2>/dev/null || true
  elif command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w 1920 -h 1080 "${WALLPAPER_DIR}/desktop.svg" \
      > "${WALLPAPER_DIR}/desktop.png" 2>/dev/null || true
  fi

  log_warn "Using generated SVG wallpaper — replace with a proper PNG at ${WALLPAPER_DIR}/desktop.png"
fi

log_info "Wallpapers deployed"

# ── 6. LightDM Configuration ─────────────────────────────────────────────
log_step "Configuring LightDM login screen"
mkdir -p "${CHROOT_DIR}/etc/lightdm"

cat > "${CHROOT_DIR}/etc/lightdm/lightdm.conf" << 'EOF'
[Seat:*]
greeter-session=lightdm-gtk-greeter
session-wrapper=/etc/X11/Xsession
allow-guest=false
autologin-user=
autologin-user-timeout=0
user-session=xfce
EOF

cat > "${CHROOT_DIR}/etc/lightdm/lightdm-gtk-greeter.conf" << EOF
[greeter]
background=/usr/share/horus/wallpapers/login-bg.png
fallback-background=#0a0a0f
theme-name=Adwaita-dark
icon-theme-name=Papirus-Dark
font-name=Inter 11
clock-format=%H:%M  ·  %A, %d %B
indicators=~spacer;~clock;~spacer;~power
position=50%,center 50%,center
panel-position=top
xft-antialias=true
xft-dpi=96
xft-hintstyle=slight
xft-rgba=rgb
hide-user-image=false
EOF

cp "${WALLPAPER_DIR}/desktop.png" "${WALLPAPER_DIR}/login-bg.png" 2>/dev/null || true
log_info "LightDM configured"

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

# ── 8. GTK Theme Placeholder ─────────────────────────────────────────────
log_step "Setting GTK theme"
mkdir -p "${CHROOT_DIR}/etc/skel/.config/gtk-3.0"
cat > "${CHROOT_DIR}/etc/skel/.config/gtk-3.0/settings.ini" << 'EOF'
[Settings]
gtk-theme-name=Adwaita-dark
gtk-icon-theme-name=Papirus-Dark
gtk-font-name=Inter 11
gtk-cursor-theme-name=DMZ-White
gtk-cursor-theme-size=24
gtk-toolbar-style=GTK_TOOLBAR_ICONS
gtk-toolbar-icon-size=GTK_ICON_SIZE_LARGE_TOOLBAR
gtk-button-images=0
gtk-menu-images=0
gtk-enable-event-sounds=0
gtk-enable-input-feedback-sounds=0
gtk-xft-antialias=1
gtk-xft-hinting=1
gtk-xft-hintstyle=slight
gtk-xft-rgba=rgb
EOF

mkdir -p "${CHROOT_DIR}/etc/skel/.config/gtk-2.0"
cat > "${CHROOT_DIR}/etc/skel/.config/gtk-2.0/gtkrc" << 'EOF'
gtk-theme-name = "Adwaita-dark"
gtk-icon-theme-name = "Papirus-Dark"
gtk-font-name = "Inter 11"
gtk-cursor-theme-name = "DMZ-White"
EOF

log_info "GTK theme configured (Adwaita-dark + Papirus-Dark icons)"

# ── 9. XFCE4 Panel Configuration ─────────────────────────────────────────
log_step "Configuring XFCE4 defaults"
mkdir -p "${CHROOT_DIR}/etc/skel/.config/xfce4/xfconf/xfce-perchannel-xml"

cat > "${CHROOT_DIR}/etc/skel/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfce4-desktop" version="1.0">
  <property name="backdrop" type="empty">
    <property name="screen0" type="empty">
      <property name="monitor0" type="empty">
        <property name="workspace0" type="empty">
          <property name="image-path" type="string" value="/usr/share/horus/wallpapers/desktop.png"/>
          <property name="image-style" type="int" value="5"/>
          <property name="color-style" type="int" value="0"/>
          <property name="rgba1" type="array">
            <value type="double" value="0.039216"/>
            <value type="double" value="0.039216"/>
            <value type="double" value="0.058824"/>
            <value type="double" value="1"/>
          </property>
        </property>
      </property>
    </property>
  </property>
</channel>
EOF

cat > "${CHROOT_DIR}/etc/skel/.config/xfce4/xfconf/xfce-perchannel-xml/xfwm4.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfwm4" version="1.0">
  <property name="general" type="empty">
    <property name="theme" type="string" value="Default-hdpi"/>
    <property name="title_font" type="string" value="Inter Bold 10"/>
    <property name="use_compositing" type="bool" value="true"/>
    <property name="frame_opacity" type="int" value="95"/>
    <property name="shadow_delta_height" type="int" value="-3"/>
    <property name="shadow_delta_width" type="int" value="0"/>
    <property name="shadow_delta_x" type="int" value="0"/>
    <property name="shadow_delta_y" type="int" value="-3"/>
    <property name="shadow_opacity" type="int" value="60"/>
    <property name="shadow_x_offset" type="int" value="1"/>
    <property name="shadow_y_offset" type="int" value="4"/>
  </property>
</channel>
EOF

log_info "XFCE4 defaults configured"

echo -e "\n${GOLD}  HORUS OS branding setup complete${NC}\n"
