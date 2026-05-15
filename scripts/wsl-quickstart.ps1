# ═══════════════════════════════════════════════════════════════════
#  HORUS EDU OS — Windows Quick Start via WSL2
#  يشغّل تطبيقات حورس على Windows مباشرة بدون ISO
#  تشغيل: PowerShell كـ Administrator ثم: .\scripts\wsl-quickstart.ps1
# ═══════════════════════════════════════════════════════════════════

$GOLD  = "`e[38;2;201;162;39m"
$CYAN  = "`e[38;2;0;212;255m"
$GREEN = "`e[0;32m"
$RED   = "`e[0;31m"
$NC    = "`e[0m"
$BOLD  = "`e[1m"

function Write-Banner {
    Write-Host ""
    Write-Host "$GOLD$BOLD  ██╗  ██╗ ██████╗ ██████╗ ██╗   ██╗███████╗$NC"
    Write-Host "$GOLD$BOLD  ██║  ██║██╔═══██╗██╔══██╗██║   ██║██╔════╝$NC"
    Write-Host "$GOLD$BOLD  ███████║██║   ██║██████╔╝██║   ██║███████╗ $NC"
    Write-Host "$GOLD$BOLD  ██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║ $NC"
    Write-Host "$GOLD$BOLD  ██║  ██║╚██████╔╝██║  ██║╚██████╔╝███████║ $NC"
    Write-Host "$GOLD$BOLD  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝ $NC"
    Write-Host ""
    Write-Host "$GOLD$BOLD  Horus Edu OS — WSL2 Quick Start$NC"
    Write-Host "$CYAN  جامعة حورس · التعلم بلا حدود$NC"
    Write-Host "$GOLD  ─────────────────────────────────────────$NC"
    Write-Host ""
}

function Write-Step  { param($msg) Write-Host "`n$GOLD$BOLD══ $msg ══$NC" }
function Write-OK    { param($msg) Write-Host "$GREEN  ✓$NC  $msg" }
function Write-Info  { param($msg) Write-Host "$CYAN  →$NC  $msg" }
function Write-Warn  { param($msg) Write-Host "$GOLD  ⚠$NC  $msg" }
function Write-Err   { param($msg) Write-Host "$RED  ✗$NC  $msg"; exit 1 }

# ── Check Admin ──────────────────────────────────────────────────────
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Err "شغّل PowerShell كـ Administrator (Run as Administrator)"
}

Write-Banner

# ── Check Windows Version ────────────────────────────────────────────
Write-Step "Checking Requirements"
$winVer = [System.Environment]::OSVersion.Version
if ($winVer.Build -lt 19041) {
    Write-Err "يتطلب Windows 10 Build 19041+ أو Windows 11"
}
Write-OK "Windows version: $($winVer.Major).$($winVer.Minor) (Build $($winVer.Build))"

# ── Install WSL2 if needed ───────────────────────────────────────────
Write-Step "Setting Up WSL2"
$wslInstalled = (wsl --list --quiet 2>$null) -ne $null
if (-not $wslInstalled) {
    Write-Info "Installing WSL2 + Ubuntu 22.04..."
    wsl --install -d Ubuntu-22.04
    Write-Warn "REBOOT REQUIRED — أعد التشغيل ثم شغّل السكريبت مرة ثانية"
    Read-Host "اضغط Enter للريبوت الآن"
    Restart-Computer -Force
    exit
}

# Check if Ubuntu 22.04 is available
$ubuntuAvailable = (wsl --list --quiet 2>$null) -match "Ubuntu-22.04|Ubuntu"
if (-not $ubuntuAvailable) {
    Write-Info "Installing Ubuntu 22.04..."
    wsl --install -d Ubuntu-22.04
    Write-Warn "Ubuntu being installed — wait for it to finish then re-run this script"
    exit
}
Write-OK "WSL2 + Ubuntu ready"

# ── Get repo path in WSL ─────────────────────────────────────────────
Write-Step "Locating Horus OS Source"
$repoWin = $PSScriptRoot | Split-Path -Parent
$repoParts = $repoWin -replace '\\', '/' -replace '^([A-Za-z]):', '/mnt/$1'
$repoParts = $repoParts.Substring(0,6) + $repoParts.Substring(6).ToLower()
$repoWSL = $repoParts
Write-OK "Repo path in WSL: $repoWSL"

# ── Install everything in WSL ────────────────────────────────────────
Write-Step "Installing Horus Edu Apps in WSL2"
Write-Info "هيتطلب إنترنت وشوية وقت (~5-10 دقايق)..."

$installScript = @'
set -e
GOLD='\033[38;2;201;162;39m'
GREEN='\033[0;32m'
CYAN='\033[38;2;0;212;255m'
NC='\033[0m'

log() { echo -e "${CYAN}  →${NC}  $1"; }
ok()  { echo -e "${GREEN}  ✓${NC}  $1"; }

log "Updating apt..."
sudo apt-get update -qq

log "Installing Python + pip..."
sudo apt-get install -y python3 python3-pip python3-venv curl wget git 2>/dev/null

log "Installing Python dependencies..."
pip3 install --quiet fastapi "uvicorn[standard]" pydantic httpx psutil aiofiles python-multipart

log "Installing Ollama (AI engine)..."
curl -fsSL https://ollama.com/install.sh | sh 2>/dev/null || true

ok "Base installation complete!"
'@

wsl -d Ubuntu-22.04 -- bash -c $installScript

Write-OK "Dependencies installed"

# ── Create start script inside WSL ───────────────────────────────────
Write-Step "Creating Launch Scripts"

$launchScript = @"
#!/bin/bash
REPO="$repoWSL"
GOLD='\033[38;2;201;162;39m'
GREEN='\033[0;32m'
CYAN='\033[38;2;0;212;255m'
NC='\033[0m'

echo -e "\${GOLD}══ Starting Horus Edu OS Services ══\${NC}"

# Edu Hub (port 9100)
if [ -d "\$REPO/apps/edu-hub/backend" ]; then
    cd "\$REPO/apps/edu-hub/backend"
    echo -e "\${CYAN}  →\${NC}  Starting Edu Hub on port 9100..."
    nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 9100 > /tmp/horus-hub.log 2>&1 &
    echo \$! > /tmp/horus-hub.pid
fi

# AI Tutor (port 9101)
if [ -d "\$REPO/apps/edu-ai-tutor" ]; then
    cd "\$REPO/apps/edu-ai-tutor"
    echo -e "\${CYAN}  →\${NC}  Starting AI Tutor on port 9101..."
    nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 9101 > /tmp/horus-ai.log 2>&1 &
    echo \$! > /tmp/horus-ai.pid
fi

sleep 2

echo ""
echo -e "\${GREEN}  ✓\${NC}  Services started!"
echo -e "\${GOLD}  ─────────────────────────────────\${NC}"
echo -e "\${CYAN}  Edu Hub  →\${NC}  http://localhost:9100"
echo -e "\${CYAN}  AI Tutor →\${NC}  http://localhost:9101"
echo -e "\${GOLD}  ─────────────────────────────────\${NC}"
"@

wsl -d Ubuntu-22.04 -- bash -c "echo '$launchScript' > /tmp/horus-start.sh && chmod +x /tmp/horus-start.sh"

# ── Create Windows shortcut to launch ────────────────────────────────
Write-Step "Creating Desktop Shortcut"

$shortcutPath = "$env:USERPROFILE\Desktop\Horus Edu OS.lnk"
$wshell = New-Object -ComObject WScript.Shell
$shortcut = $wshell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wsl.exe"
$shortcut.Arguments = "-d Ubuntu-22.04 -- bash /tmp/horus-start.sh"
$shortcut.Description = "Start Horus Edu OS Services"
$shortcut.WorkingDirectory = $env:USERPROFILE
$shortcut.Save()

Write-OK "Desktop shortcut created: 'Horus Edu OS'"

# ── Launch now ───────────────────────────────────────────────────────
Write-Step "Launching Horus Edu OS"
Write-Info "Starting services..."

wsl -d Ubuntu-22.04 -- bash /tmp/horus-start.sh

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "$GOLD$BOLD  ══════════════════════════════════════$NC"
Write-Host "$GOLD$BOLD  ✅ Horus Edu OS is RUNNING!$NC"
Write-Host "$GOLD$BOLD  ══════════════════════════════════════$NC"
Write-Host ""
Write-Host "$CYAN  Edu Hub  → $NC http://localhost:9100"
Write-Host "$CYAN  AI Tutor → $NC http://localhost:9101"
Write-Host ""
Write-Host "$GREEN  فتح المتصفح...$NC"

Start-Process "http://localhost:9100"
Start-Sleep -Seconds 1
Start-Process "http://localhost:9101"

Write-Host ""
Write-Host "$GOLD  لإيقاف الخدمات:$NC"
Write-Host "  wsl -d Ubuntu-22.04 -- bash -c 'kill \$(cat /tmp/horus-*.pid 2>/dev/null)'"
Write-Host ""
