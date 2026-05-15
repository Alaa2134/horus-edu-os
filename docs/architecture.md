# HORUS OS — Technical Architecture

> Version 1.0.0 | Created by Alaa Saber

---

## Overview

HORUS OS is a custom Linux-based operating system assembled from Ubuntu 22.04 LTS minimal as the foundation, with comprehensive modifications at every layer — boot, display, desktop, services, and applications. This document describes each layer, the technology choices, data flows, and the rationale behind every major decision.

---

## System Layer Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                            │
│         Desktop GUI  ·  Terminal  ·  HORUS Apps  ·  AI Chat        │
├─────────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                            │
│                                                                     │
│  ┌────────────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐  │
│  │ Control Center │  │    AI    │  │   Demo    │  │  Security  │  │
│  │  FastAPI:8420  │  │  :8421   │  │   Mode    │  │   Center   │  │
│  │  React/Tauri   │  │ Ollama   │  │  React    │  │  :8422     │  │
│  └────────────────┘  └──────────┘  └───────────┘  └────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                         DESKTOP LAYER                               │
│   XFCE4 Session  ·  Horus Dark GTK Theme  ·  Picom Compositor      │
│   xfwm4 (WM)  ·  xfce4-panel  ·  Thunar (file mgr)                │
├─────────────────────────────────────────────────────────────────────┤
│                         DISPLAY LAYER                               │
│   LightDM  ·  lightdm-gtk-greeter  ·  Horus Greeter Theme          │
│   Xorg (X11)  ·  Display drivers                                    │
├─────────────────────────────────────────────────────────────────────┤
│                           BOOT LAYER                                │
│   GRUB2 (Horus Theme)  →  Linux Kernel  →  initramfs               │
│   Plymouth (Horus Script Animation)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                          SYSTEM LAYER                               │
│   Ubuntu 22.04 LTS Minimal  ·  Linux Kernel 5.15+                  │
│   systemd  ·  dbus  ·  udev  ·  NetworkManager                     │
│   PulseAudio / Pipewire  ·  BlueZ  ·  upower                       │
├─────────────────────────────────────────────────────────────────────┤
│                         HARDWARE LAYER                              │
│   CPU  ·  RAM  ·  SSD/NVMe  ·  Display  ·  Network  ·  Battery     │
│   GPIO  ·  I2C  ·  SPI  ·  USB  ·  Bluetooth  ·  Sensors           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Boot (GRUB2 + Plymouth)

### GRUB2 Theme
- Location: `/boot/grub/themes/horus/`
- `theme.txt` defines layout: HORUS OS branding labels, menu styling, progress bar
- Background: dark (`#0a0a0f`) with gold text (`#c9a227`)
- Boot entries: HORUS OS Start, Safe Mode, Install
- EFI + BIOS hybrid boot (xorriso dual-mode ISO)

### Plymouth Animation
- Module: `script` (gives full scripting control)
- Script: `/usr/share/plymouth/themes/horus/horus.script`
- Animation: background gradient fade → logo fade-in → title text → progress bar
- Colors: `#0a0a0f` background, `#c9a227` logo/text, `#00d4ff` glow elements
- Assets: `horus-logo.png` (rendered from SVG), `progress_bar.png`, `progress_box.png`
- Kernel cmdline: `quiet splash` enables Plymouth

---

## Layer 2: System Foundation (Ubuntu 22.04 LTS)

HORUS OS uses **debootstrap** to create a minimal Ubuntu 22.04 (Jammy Jellyfish) root filesystem. This provides:

- **Stability:** Ubuntu LTS with 5-year support, proven hardware compatibility
- **Package ecosystem:** APT + 80,000+ packages
- **Kernel:** Linux 5.15 LTS (generic or lowlatency)
- **systemd:** Full service management, proper boot ordering
- **Why Ubuntu over Arch/Gentoo:** Fastest path to competition-ready build. Hardware just works.

### Key system customizations
```
/etc/os-release          → HORUS OS identity (NAME, VERSION, PRETTY_NAME)
/etc/hostname            → horus-os
/etc/hosts               → 127.0.1.1 horus-os
/etc/locale.gen          → en_US.UTF-8, ar_SA.UTF-8
/etc/default/keyboard    → LAYOUT=us,ara
/etc/environment         → LANG=en_US.UTF-8
```

---

## Layer 3: Desktop Environment (XFCE4 + Horus Dark)

### Why XFCE4?
- Extremely customizable: GTK theme, icons, compositor, panel all independently replaceable
- Lightweight: ~300 MB RAM vs ~800 MB for GNOME
- Stable: no wayland/shader issues on diverse hardware
- Fast: smooth on i3-class hardware, no animation jank
- The visual transformation from stock XFCE4 to HORUS is 100% through config files, no patches

### Desktop Components
| Component | Package | Role |
|---|---|---|
| Session | `xfce4` | Desktop session |
| Window Manager | `xfwm4` | Manages windows, compositing |
| Panel | `xfce4-panel` | Taskbar (bottom, 48px) |
| File Manager | `thunar` | File browsing |
| Compositor | `picom` | Transparency, blur, shadows |
| App Launcher | `xfce4-appfinder` | Horus Launcher |
| Screensaver | `xscreensaver` | Lock screen |

### Horus Dark GTK Theme
- GTK 2 + GTK 3 theme (`.themes/Horus-Dark/`)
- Colors: all derived from `branding/palette/colors.json`
- Glass effect: `rgba(255,255,255,0.05)` backgrounds with `backdrop-filter: blur(12px)`
- Gold accents: `#c9a227` for selected items, focus indicators, active states
- Icon theme: **Papirus-Dark** (modified with custom HORUS app icons)

### Picom Configuration
```
# Transparency
opacity-rule = ["90:class_g = 'Xfce4-terminal'"];
# Shadow
shadow = true; shadow-radius = 15; shadow-opacity = 0.4;
# Blur (if GPU supports)
backend = "glx"; blur-method = "dual_kawase"; blur-strength = 5;
# Animations
transition-length = 300; transition-pow-x = 0.5;
```

---

## Layer 4: Display Manager (LightDM)

- **LightDM** with `lightdm-gtk-greeter`
- Greeter config: `/etc/lightdm/lightdm-gtk-greeter.conf`
- Background: `horus/wallpapers/login-bg.png` (cyberpunk-Egyptian, 1920×1080)
- Clock format: `%H:%M — %A %d %B`
- Indicator: clock + power button only (minimal)
- Theme: Horus-Dark GTK + Papirus-Dark icons
- Font: Inter 11

---

## Layer 5: Application Layer

### HORUS Control Center
```
apps/horus-control-center/
├── backend/
│   ├── main.py            FastAPI app on port 8420
│   └── requirements.txt   fastapi, uvicorn, psutil, aiofiles
├── frontend/
│   ├── src/App.tsx         React root with routing
│   ├── src/components/     Dashboard, CPUCard, MemoryCard, etc.
│   ├── package.json        React + Tailwind + Recharts
│   └── tailwind.config.js  Horus color palette
└── launch.sh              Starts backend + opens frontend in browser
```

**Data Flow:**
```
psutil / /proc / /sys  →  FastAPI (Python)  →  REST API  →  React (polling 2s)  →  UI
```

**Endpoints:**
- `GET /api/system` — OS info, hostname, uptime, kernel
- `GET /api/cpu` — percent, per-core, freq, model, load avg
- `GET /api/memory` — total, used, percent, swap
- `GET /api/disks` — per-partition usage
- `GET /api/network` — per-interface bytes, packets, IP
- `GET /api/temperatures` — lm-sensors data
- `GET /api/battery` — percent, plugged, time remaining
- `GET /api/processes` — top N processes by CPU
- `GET /api/full-report` — JSON export of all metrics
- `POST /api/performance-mode/{mode}` — set CPU governor

### HORUS AI Assistant
```
apps/horus-ai-assistant/
├── main.py                FastAPI on port 8421
├── requirements.txt       fastapi, uvicorn, httpx, ollama
├── knowledge_base.json    HORUS OS facts, commands, hardware info
└── frontend/
    └── src/App.tsx        React chat interface
```

**AI Model:** Ollama with Mistral 7B (offline) or `claude-haiku-4-5-20251001` via API (online)

**Modes:**
- `student` — simplified explanations, learning-friendly
- `engineer` — technical depth, precise answers
- `debug` — focuses on diagnostics and logs
- `demo` — optimized responses for competition presentation

**Context injected on every request:**
```json
{
  "os_name": "HORUS OS",
  "version": "1.0.0",
  "hostname": "horus-os",
  "cpu_model": "...",
  "memory_total": "...",
  "creator": "Alaa Saber"
}
```

### HORUS Demo Mode
- Pure React SPA, served from `localhost:3000` or opened as static HTML
- Full-screen kiosk mode (`--kiosk` flag in Chromium/Firefox)
- Sections: Overview, Why Horus, Features, Live Stats (polling Control Center API), Use Cases, Roadmap, Credits
- Language toggle: Arabic / English
- Auto-advance mode: cycles sections every 30 seconds

### HORUS Security Center
```
apps/horus-security-center/
├── main.py                FastAPI on port 8422
└── frontend/              React dashboard
```

Reads: UFW status, sshd config, LUKS status, `/proc/net/tcp`, `/var/log/syslog`

### Desktop Launcher (`.desktop` files)
All custom apps have desktop entries in `/usr/share/applications/` with:
- HORUS custom icons
- Arabic + English names and descriptions
- `StartupNotify=true`
- Proper categories for app menu

---

## Service Architecture

### systemd Services
```
/etc/systemd/system/
├── horus-control-center.service    (port 8420, starts on boot)
├── horus-ai-assistant.service      (port 8421, starts on demand)
└── horus-demo.service              (optional, kiosk mode on boot)
```

Control Center starts automatically so system metrics are ready when the desktop loads.

---

## Developer Toolchain

| Category | Tool | Version |
|---|---|---|
| Language | Python | 3.11 |
| Language | Node.js | 18 LTS |
| Compiler | GCC/G++ | 12 |
| Build | CMake | 3.22+ |
| Version control | Git | 2.34+ |
| Microcontrollers | Arduino CLI | 0.35+ |
| Embedded | PlatformIO Core | 6.x |
| Serial | minicom, screen | latest |
| Hardware | i2c-tools, libgpiod | latest |
| Sensors | lm-sensors | latest |
| Monitor | htop, btop | latest |
| Info | fastfetch, neofetch | latest |
| Editor | VS Code | stable |

---

## Localization

- **System locale:** `en_US.UTF-8` (default), `ar_SA.UTF-8` (alternate)
- **Desktop:** XFCE4 supports full RTL via `LC_ALL=ar_SA.UTF-8 startxfce4`
- **Keyboard:** US + Arabic layout, `Super+Space` toggle
- **Fonts:** Noto Naskh Arabic for all Arabic text, proper shaping via HarfBuzz
- **Custom apps:** All have `lang` state variable, `ar`/`en` toggle in header

---

## ISO Build System

```
build-iso.sh
├── check_prerequisites()    installs debootstrap, squashfs, xorriso
├── bootstrap_base()         creates minimal Ubuntu 22.04 chroot
├── prepare_chroot()         mounts /proc /sys /dev, sets up APT
├── install_packages()       installs all packages inside chroot
├── apply_branding()         copies os-release, Plymouth, GRUB, wallpapers
├── install_horus_apps()     copies and builds custom applications
├── configure_services()     enables LightDM, NetworkManager, bluetooth
├── create_live_user()       creates horus-user with demo credentials
├── build_iso()              mksquashfs → xorriso → hybrid ISO
└── cleanup_chroot()         unmounts pseudo-filesystems
```

Output: `dist/horus-os-1.0.0-amd64.iso` + SHA256 checksum

---

## Security Model

HORUS OS does not introduce new vulnerabilities:
- Ships with **UFW** (firewall) enabled, default deny incoming
- **SSH** is installed but disabled by default (enabled via Security Center)
- All HORUS app backends bind to `127.0.0.1` only (not exposed to network)
- No root auto-login
- Passwords hashed with standard Linux shadow utilities
- Disk encryption (LUKS) available during installation via ubiquity

---

## Why This Is Not Just a Theme

| Claim | Evidence |
|---|---|
| Custom OS identity | `/etc/os-release` overwritten with HORUS data; shows in every system info tool |
| Custom boot | Plymouth script theme with animation; GRUB2 visual theme with HORUS branding |
| Custom applications | 5 original apps not present on any distro |
| Custom toolchain | Pre-configured environment optimized for embedded work |
| Custom defaults | Hostname, locale, terminal, fastfetch, wallpaper, keyboard shortcuts all HORUS |
| Build reproducibility | `build-iso.sh` produces a flashable ISO from scratch |
| Real hardware reads | Control Center reads actual hardware data, not mocked |

---

## Future Architecture (v2.0+)

- **Custom Flutter desktop shell** replacing XFCE4 entirely
- **HORUS Package Repository** with signed `.deb` packages
- **Custom kernel configuration** (lowlatency, RT patches for embedded)
- **Hardware Abstraction Layer** for GPIO/I2C/SPI unified API
- **Cloud sync** for HORUS AI session history (opt-in)
- **Remote management** via SSH + HORUS Web Console
