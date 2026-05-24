<div align="center">

```
██╗  ██╗ ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗
██║  ██║██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔═══██╗██╔════╝
███████║██║   ██║██████╔╝██║   ██║███████╗    ██║   ██║███████╗
██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║    ██║   ██║╚════██║
██║  ██║╚██████╔╝██║  ██║╚██████╔╝███████║    ╚██████╔╝███████║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚══════╝
```

**HORUS OS — The Egyptian AI & Robotics Linux Distribution**

*نظام حورس — توزيعة لينكس المصرية للذكاء الاصطناعي والروبوتيكس*

*Install once. Build robots, AI apps, and engineering projects — instantly.*

[![Version](https://img.shields.io/badge/version-1.0.0-c9a227?style=flat-square&labelColor=0a0a0f)](.)
[![Base](https://img.shields.io/badge/base-Ubuntu%2022.04%20LTS-E95420?style=flat-square&labelColor=0a0a0f)](.)
[![Arch](https://img.shields.io/badge/arch-x86__64%20%7C%20ARM64-00d4ff?style=flat-square&labelColor=0a0a0f)](.)
[![Creator](https://img.shields.io/badge/creator-Alaa%20Saber-1a73e8?style=flat-square&labelColor=0a0a0f)](.)
[![License](https://img.shields.io/badge/license-MIT-c9a227?style=flat-square&labelColor=0a0a0f)](LICENSE)

</div>

---

## What is HORUS OS?

HORUS OS is a **custom Linux-based operating system** built for embedded laptops, AI education, hardware control, and student innovation. It is not a skin or a theme — it is a complete, branded system with:

- A full custom boot experience (Plymouth animated splash + branded GRUB)
- A premium cyber-Egyptian desktop identity from first login to last session
- **5 purpose-built applications** unique to this OS
- A pre-configured embedded development environment
- A built-in AI assistant aware of the OS, hardware, and its own purpose
- Competition-grade documentation, pitch materials, and demo mode

> **Creator:** Alaa Saber
> **Purpose:** AI, robotics & engineering education — and university competitions
> **Positioning:** The Egyptian AI & Robotics Linux distribution — beginner-first

**Product docs:** [Product Direction](docs/PRODUCT.md) ·
[Design System](docs/DESIGN-SYSTEM.md) · [Roadmap](ROADMAP.md) ·
[Pitch](docs/PITCH.md) · [Prompts](docs/PROMPTS.md) ·
[Community & Landing Copy](docs/COMMUNITY.md) · [Run in a VM](vm/README.md)

HORUS OS is built on Ubuntu 22.04 LTS minimal with GNOME Shell (on Mutter) as the desktop foundation, transformed through comprehensive theming, custom applications, and a unified brand identity rooted in Ancient Egyptian heritage and futuristic embedded intelligence.

---

## Key Features

| Feature | Description |
|---|---|
| **Custom Boot** | Plymouth animated splash + GRUB2 theme with HORUS branding |
| **Custom Identity** | Branded desktop, login, terminal, taskbar, and all system text |
| **Control Center** | Real-time CPU, RAM, disk, network, temperature, battery monitoring |
| **AI Assistant** | Built-in chat AI with OS and hardware awareness, 4 operation modes |
| **Demo Mode** | Full-screen kiosk app for competition presentations |
| **Security Center** | Firewall, SSH, encryption, network connections, logs viewer |
| **Dev Toolchain** | Python 3, Node.js, Git, GCC, CMake, Arduino CLI, PlatformIO |
| **Hardware Tools** | i2c-tools, GPIO control, lm-sensors, serial monitor (minicom) |
| **Localization** | Full Arabic and English support, RTL layout |
| **Terminal** | Custom welcome banner, fastfetch with HORUS ASCII art |

---

## Architecture Overview

```
HORUS OS
├── APPLICATION LAYER   HORUS Control Center · AI Assistant · Demo Mode · Security Center
├── DESKTOP LAYER       GNOME Shell (Mutter) + Yaru-Dark + Horus dock + pyramid wallpaper
├── DISPLAY LAYER       GDM3 (dark greeter, Wayland)
├── BOOT LAYER          GRUB2 (Horus theme) + Plymouth (Horus script animation)
└── SYSTEM LAYER        Ubuntu 22.04 LTS minimal + Linux 5.15+ + systemd
```

See [docs/architecture.md](docs/architecture.md) for full technical depth.

---

## Hardware Requirements

### Minimum
- CPU: x86_64 dual-core 1.5 GHz
- RAM: 2 GB
- Storage: 16 GB
- Display: 1280×720

### Recommended (Competition Demo)
- CPU: Intel Core i5 / AMD Ryzen 5 (7th gen or newer)
- RAM: 8 GB
- Storage: 128 GB SSD
- Display: 1920×1080 IPS

### Supported Platforms
- x86_64 laptops and mini PCs (primary, full support)
- Raspberry Pi 4B / 5 with 4 GB+ RAM (ARM build, secondary)

---

## Quick Start

### Install from ISO (End Users)
```bash
# 1. Flash the ISO to USB
sudo dd if=horus-os-1.0.0-amd64.iso of=/dev/sdX bs=4M status=progress && sync

# 2. Boot target machine from USB (set USB as first boot device in BIOS)

# 3. Follow the first-boot setup wizard
#    — choose language, create user, configure Wi-Fi

# 4. HORUS OS is ready
```

### Build from Source (Developers)
```bash
# Requires: Ubuntu 22.04 LTS build machine with ~8 GB free disk and sudo

git clone https://github.com/alaasaber/horus-os
cd horus-os
chmod +x scripts/*.sh
sudo scripts/build-iso.sh

# Output: dist/horus-os-1.0.0-amd64.iso
```

---

## Custom Applications

### HORUS Control Center
Real-time system monitor and control panel. Backend: Python FastAPI + psutil reading `/proc` and `/sys`. Frontend: React + Tailwind, packaged as Tauri desktop app. Shows CPU, RAM, disk, network, temperature, battery, USB devices, hardware info, process list. Includes performance modes (performance / balanced / powersave) and system report export.

Launch: `horus-control` in terminal or via app menu.

### HORUS AI Assistant
Built-in conversational AI with OS and hardware awareness. Runs locally via Ollama (Mistral 7B, no internet required) with fallback to cloud API when online. Four modes: Student, Engineer, Debug, Competition Demo. Can explain hardware status, help with Python/Arduino/Linux, and open apps by voice command.

Launch: `horus-ai` in terminal or via app menu.

### HORUS Demo Mode
Full-screen kiosk application for competition demonstrations. Presents what HORUS OS is, why it was built, live system statistics, feature highlights, embedded use cases, roadmap, and credits. Auto-launches option available.

Launch: `horus-demo` or set as startup application.

### HORUS Security Center
Security dashboard: firewall (UFW) status, SSH configuration, disk encryption info, active network connections, system log viewer, security recommendations, and privacy dashboard.

Launch: `horus-security` in terminal or via app menu.

### HORUS Robotics
The maker hub. Auto-detects connected Arduino/ESP32 boards (via `arduino-cli` or a serial scan), scaffolds runnable projects from templates, and includes a beginner wiring helper (pin maps for common sensors/modules on UNO and ESP32) plus a live toolchain status panel. Backend: Python FastAPI + pyserial on port 8423.

Launch: `horus-robotics` in terminal or via app menu.

### HORUS Browser
The native web browser, built on GTK3 + WebKit2GTK and themed in the HORUS identity. Tabbed browsing, a branded start page with quick links to the HORUS apps, and an `--app` chromeless mode that doubles as the shell for the HORUS web apps.

Launch: `horus-browser` in terminal or via the dock.

### Maker & developer commands
```bash
horus-setup arduino esp32   # one-click toolchains (also: ros2, pytorch, flutter, docker, node, web)
horus-doctor --fix          # diagnose & fix serial permissions, apt health, missing tools
horus-help                  # list all HORUS commands
```

### HORUS About
System information page showing OS version, hardware specs, installed tools, kernel, uptime, and credits. The "system identity card" of HORUS OS.

---

## Developer Tools (Pre-installed)

```
Languages    Python 3.11, Node.js 18 LTS, GCC 12, G++ 12
Build        Git 2.x, Make, CMake, Ninja
Embedded     Arduino CLI, PlatformIO Core, minicom, screen
Hardware     i2c-tools, spi-dev, libgpiod, lm-sensors, upower
Terminals    htop, btop, fastfetch, neofetch
Editors      VS Code (stable), micro
Network      nmap, curl, wget, netcat, ssh
```

---

## Branding

| Element | Specification |
|---|---|
| Primary color | Horus Gold `#c9a227` |
| Secondary | Electric Blue `#1a73e8` |
| Accent | Cyber Cyan `#00d4ff` |
| Background | Deep Black `#0a0a0f` |
| Surface | Dark Navy `#12121a` |
| Display font | **Cinzel** (Egyptian classical) |
| UI font | **Inter** |
| Mono font | **JetBrains Mono** |
| Arabic font | **Noto Naskh Arabic** |
| Style | Glassmorphism · Neon glow · Geometric precision |

---

## Slogans

| Language | Slogan |
|---|---|
| English | *HORUS OS — Intelligence Awakened* |
| Arabic | *نظام حورس — ذكاء مدمج للمستقبل* |
| Tagline | *Built for Embedded Intelligence* |
| Competition | *The Future of Student-Built Computing* |

---

## Project Structure

```
horus-os/
├── README.md
├── docs/
│   ├── architecture.md            Full technical architecture
│   ├── build-guide.md             Step-by-step build instructions
│   ├── installation.md            End-user installation guide
│   ├── hardware-guide.md          Hardware requirements and compatibility
│   ├── competition-demo.md        Demo script for judges
│   └── troubleshooting.md         Common issues and fixes
├── scripts/
│   ├── build-iso.sh               Main ISO build (debootstrap + squashfs + xorriso)
│   ├── customize-rootfs.sh        Applies branding, config, apps to chroot
│   ├── install-packages.sh        Package installation inside chroot
│   ├── setup-branding.sh          Deploys Plymouth, GRUB, wallpapers, themes
│   ├── setup-services.sh          Configures systemd services
│   └── create-user.sh             Creates default live user
├── apps/
│   ├── horus-control-center/      FastAPI backend + React/Tailwind frontend
│   ├── horus-ai-assistant/        Python + Ollama + React chat UI
│   ├── horus-demo-mode/           React kiosk SPA
│   ├── horus-security-center/     Python + React security dashboard
│   └── horus-about/               HTML/CSS about page
├── branding/
│   ├── logo/                      SVG logo + exports
│   ├── wallpapers/                 Desktop, login, lock screen
│   ├── plymouth/                  Boot splash theme
│   ├── grub-theme/                GRUB2 visual theme
│   ├── wallpapers/                Desktop wallpapers (pyramids SVG)
│   ├── palette/                   colors.json — full color system
│   └── prompts/                   Image generation prompts for all visuals
├── configs/
│   ├── os-release                 OS identity file
│   ├── fastfetch/                 fastfetch config
│   ├── terminal-welcome.sh        Terminal welcome banner
│   ├── gnome/                     GNOME dconf system defaults
│   └── systemd/                   Service unit files
├── presentation/
│   ├── pitch-script.md            30s / 2min / 5min pitches (AR + EN)
│   ├── poster-content.md          Competition poster content
│   └── slides-outline.md          Presentation structure
└── assets/                        Shared fonts and images
```

---

## Build Requirements

The build script runs on Ubuntu 22.04 LTS and automatically installs all prerequisites. Manual dependencies:

```bash
sudo apt-get install -y debootstrap squashfs-tools xorriso \
    grub-pc-bin grub-efi-amd64-bin mtools dosfstools
```

Build time: approximately 45–90 minutes depending on internet speed and hardware.

---

## Roadmap

| Phase | Feature |
|---|---|
| v1.0 | Custom boot, desktop, Control Center, Demo Mode, Security Center |
| v1.1 | HORUS AI with local Ollama inference |
| v1.2 | Custom GNOME Shell extension suite — Horus launcher, panel, workspace effects |
| v1.3 | Full first-boot OEM setup wizard |
| v2.0 | Custom kernel configuration, signed packages, HORUS APT repository |

---

## Credits

**Creator & Lead Engineer:** Alaa Saber

University Competition Project — Embedded Systems & Student Innovation

Built with: Ubuntu, GNOME Shell, Yaru, Python, FastAPI, React, Tailwind CSS, Tauri, Plymouth, GRUB2, Ollama

---

## License

HORUS OS custom components (applications, scripts, branding, documentation) are released under the **MIT License**.

Underlying system components retain their original licenses (GPL-2.0, GPL-3.0, LGPL, etc.). HORUS OS does not modify or claim ownership of these components.
