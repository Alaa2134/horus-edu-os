#!/bin/bash
# HORUS OS — Service Configuration Script
# Enables and configures systemd services for HORUS OS
#
# Usage: sudo ./setup-services.sh [chroot_dir]

set -euo pipefail

CHROOT_DIR="${1:-/}"
GREEN='\033[0;32m'; GOLD='\033[38;2;201;162;39m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info() { echo -e "${GREEN}  ✓${NC}  $1"; }
log_step() { echo -e "\n${GOLD}  ▶${NC}  $1"; }
log_warn() { echo -e "${YELLOW}  ⚠${NC}  $1"; }
_chroot() { chroot "$CHROOT_DIR" bash -c "$*"; }

# ── Enable core services ──────────────────────────────────────────────────
log_step "Enabling system services"
_chroot "systemctl enable NetworkManager 2>/dev/null || true"
_chroot "systemctl enable gdm3 2>/dev/null || systemctl enable gdm 2>/dev/null || true"
_chroot "systemctl set-default graphical.target 2>/dev/null || true"
_chroot "systemctl enable bluetooth 2>/dev/null || true"
_chroot "systemctl enable systemd-timesyncd 2>/dev/null || true"
_chroot "systemctl enable ssh 2>/dev/null || true"
log_info "Core services enabled"

# ── HORUS Control Center service ─────────────────────────────────────────
log_step "Creating HORUS Control Center service"
cat > "${CHROOT_DIR}/etc/systemd/system/horus-control-center.service" << 'EOF'
[Unit]
Description=HORUS OS Control Center API
Documentation=https://github.com/alaasaber/horus-os
After=network.target
Wants=network.target

[Service]
Type=simple
User=horus-user
WorkingDirectory=/opt/horus/horus-control-center/backend
ExecStart=/usr/bin/python3 /opt/horus/horus-control-center/backend/main.py
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=horus-control-center
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF
_chroot "systemctl enable horus-control-center.service 2>/dev/null || true"
log_info "HORUS Control Center service installed"

# ── HORUS AI Assistant service ────────────────────────────────────────────
log_step "Creating HORUS AI Assistant service"
cat > "${CHROOT_DIR}/etc/systemd/system/horus-ai.service" << 'EOF'
[Unit]
Description=HORUS OS AI Assistant API
After=network.target horus-control-center.service
Requires=network.target

[Service]
Type=simple
User=horus-user
WorkingDirectory=/opt/horus/horus-ai-assistant
ExecStart=/usr/bin/python3 /opt/horus/horus-ai-assistant/main.py
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=horus-ai
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF
# AI service is NOT auto-enabled (starts on demand to save resources)
log_info "HORUS AI service installed (starts on demand)"

# ── UFW Firewall ──────────────────────────────────────────────────────────
log_step "Configuring UFW firewall"
_chroot "
  ufw --force reset 2>/dev/null || true
  ufw default deny incoming 2>/dev/null || true
  ufw default allow outgoing 2>/dev/null || true
  ufw allow ssh 2>/dev/null || true
  ufw --force enable 2>/dev/null || true
" || log_warn "UFW configuration failed"
log_info "UFW firewall enabled (deny incoming, allow SSH)"

# ── SSH Configuration ─────────────────────────────────────────────────────
log_step "Hardening SSH configuration"
cat > "${CHROOT_DIR}/etc/ssh/sshd_config.d/horus.conf" << 'EOF'
# HORUS OS SSH hardening
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
AllowAgentForwarding no
AllowTcpForwarding no
PrintMotd no
Banner /etc/ssh/horus-banner
EOF

cat > "${CHROOT_DIR}/etc/ssh/horus-banner" << 'EOF'

  ██╗  ██╗ ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗
  ██║  ██║██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔═══██╗██╔════╝
  ███████║██║   ██║██████╔╝██║   ██║███████╗    ██║   ██║███████╗
  ██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║    ██║   ██║╚════██║
  ██║  ██║╚██████╔╝██║  ██║╚██████╔╝███████║    ╚██████╔╝███████║
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚══════╝

  HORUS OS — Embedded Intelligence Platform
  Authorized access only. All activity is logged.

EOF
log_info "SSH configured and hardened"

# ── MOTD ──────────────────────────────────────────────────────────────────
log_step "Setting MOTD"
cat > "${CHROOT_DIR}/etc/motd" << 'EOF'

  HORUS OS 1.0.0 — Intelligence Awakened
  نظام حورس — ذكاء مدمج للمستقبل

  Created by Alaa Saber

  Type 'horus-help' for HORUS commands.
  Type 'fastfetch' for system information.

EOF
log_info "MOTD set"

# ── lm-sensors auto-detection ─────────────────────────────────────────────
log_step "Configuring lm-sensors"
cat > "${CHROOT_DIR}/etc/systemd/system/horus-sensors-detect.service" << 'EOF'
[Unit]
Description=HORUS Sensor Auto-Detection
After=multi-user.target
ConditionPathExists=!/etc/sensors3.conf

[Service]
Type=oneshot
ExecStart=/bin/bash -c "yes '' | sensors-detect --auto > /dev/null 2>&1 || true"
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF
_chroot "systemctl enable horus-sensors-detect.service 2>/dev/null || true"
log_info "lm-sensors auto-detection enabled"

echo -e "\n${GOLD}  Services configuration complete${NC}\n"
