# HORUS OS — Product Direction

> **The Egyptian AI & Robotics Linux Distribution**
> *Install once. Build robots, AI apps, and engineering projects instantly.*

---

## 1. Refined product description

HORUS OS is an open-source Linux distribution, based on **Ubuntu 22.04 LTS**,
purpose-built for **AI, robotics, embedded systems, and engineering education**.
It removes the single biggest barrier for students and makers — *environment
setup* — by shipping a curated, working toolchain and a layer of native apps
that turn a laptop into a ready robotics-and-AI workstation in minutes.

It is not a theme or a respin with a wallpaper. It is a coherent product:
a polished GNOME desktop with a distinct cyber-Egyptian identity, a set of
first-party apps (Center, Robotics, AI, Security, Lab, Store, Docs, Backup,
Update), one-click toolchain installers, a "fix my environment" doctor, and
offline bilingual (Arabic/English) documentation.

**Honest scope:** HORUS OS stands on the shoulders of Ubuntu, GNOME, and the
open-source ecosystem. Its value is *curation, integration, identity, and a
beginner-first experience* — not a from-scratch kernel or desktop. It can ship
a small, useful Alpha today and grow into a stable 1.0 with a community.

## 2. Target users

| Audience | What HORUS gives them |
|---|---|
| AI students | Python, Jupyter, PyTorch/scikit-learn on tap; a local AI assistant |
| Robotics students | Arduino/ESP32 auto-detect, wiring helper, ROS 2 installer |
| Arduino / ESP32 makers | Board detection, serial monitor, one-click cores, templates |
| Python developers | Clean Python 3, venv, pip, VS Code preconfigured |
| Flutter / Web developers | Node 20, Flutter installer, web starters |
| Engineering faculties | A standard lab image; identical setup on every machine |
| Competition teams | Competition Mode, demo kiosk, reproducible project templates |
| Beginners | No setup pain: it already works, with Arabic tutorials |

## 3. Full feature list

**Desktop & identity**
- GNOME Shell (Mutter) on a Yaru-dark base, themed in HORUS gold/navy
- Floating dock, app grid, branded GDM login, Plymouth boot splash, GRUB theme
- Pyramid wallpaper, Eye-of-Horus iconography, Cinzel/Ubuntu/JetBrains fonts
- Full Arabic + English locale, RTL support

**First-party apps** (see §6)
- Horus Center, Horus Robotics, Horus AI, Horus Security, Horus Lab,
  Horus Store, Horus Docs, Horus Terminal, Horus Backup, Horus Update, Horus Browser

**Maker/developer power tools**
- `horus-setup` — one-click toolchains (arduino, esp32, ros2, pytorch, flutter, docker…)
- `horus-doctor` — diagnose & fix serial permissions, apt health, missing tools
- Project templates → scaffold a working project in one click
- Board auto-detect + serial monitor + wiring helper

**Preinstalled toolchain** (see §5)

## 4. Unique features (what makes HORUS different)

1. **One-click project setup** — pick a template, get a runnable project.
2. **Arduino/ESP auto-detect** — boards appear the moment you plug them in.
3. **Fix my environment** — `horus-doctor --fix` repairs the usual maker pains.
4. **AI project generator** — describe an idea, get a scaffold (roadmap: Horus AI).
5. **Robotics wiring helper** — pin maps for common sensors/modules, UNO + ESP32.
6. **Serial monitor dashboard** — live serial in the browser (roadmap: Robotics v0.3).
7. **Student Mode** — simplified UI, guided tutorials, safe defaults.
8. **Competition Mode** — kiosk demo, offline, judge-ready presentation.
9. **Offline Arabic tutorials** — learn without internet, in your language.
10. **Error explainer** — paste an Arduino/Python/Flutter error, get a fix (Horus AI).
11. **Local AI assistant** — Ollama/Mistral offline, OpenAI fallback online.
12. **Project templates marketplace** — Horus Store: community templates & components.

## 5. Preinstalled developer tools

| Domain | Tools |
|---|---|
| Languages | Python 3.11, Node.js (installer), GCC/G++ 12 |
| Build | Git, Make, CMake, Ninja |
| Arduino/ESP32 | arduino-cli (+ AVR/ESP cores via `horus-setup`), esptool, PlatformIO |
| Raspberry Pi | i2c-tools, libgpiod, spi-tools, serial tooling |
| Embedded | minicom, screen, picocom, lm-sensors |
| AI (local) | Ollama + Mistral (installer), numpy/opencv/scikit-learn (installer) |
| AI (cloud) | OpenAI fallback in Horus AI |
| Robotics sim | Gazebo + ROS 2 Humble (installer) |
| Web | Node 20, Vite, web starters |
| Flutter | Flutter SDK (installer) |
| Containers | Docker (installer) |
| Editors | VS Code, micro, nano, vim |
| Security basics | UFW firewall, SSH hardening, nmap — defensive only, **not a hacking distro** |

## 6. Built-in app catalog

Each app: **dark glassmorphism UI, gold accents, bilingual, beginner-first.**

### Horus Center — system control
- **Purpose:** the dashboard of the machine.
- **Screens:** Overview · CPU/Memory · Disks/Network · Processes · Hardware · Report.
- **Features:** live metrics (psutil), performance modes, full system report export.
- **Beginner:** color-coded gauges, plain-language labels, one-click report.

### Horus Robotics — Arduino/ESP32/ROS tools
- **Purpose:** detect boards, scaffold projects, learn wiring.
- **Screens:** Connected Boards · New Project · Wiring Helper · Environment.
- **Features:** auto-detect (arduino-cli/pyserial), template scaffolding, wiring DB.
- **Beginner:** "plug it in and it appears", copy-paste wiring, fix-my-setup.

### Horus AI — local assistant + model manager
- **Purpose:** an OS-aware AI tutor and helper.
- **Screens:** Chat · Modes (Student/Engineer/Debug/Demo) · Models · Status.
- **Features:** Ollama local + OpenAI fallback + offline rules; error explainer.
- **Beginner:** Student Mode explains simply, in Arabic or English.

### Horus Security — safety & privacy
- **Purpose:** make security visible and friendly (defensive only).
- **Screens:** Firewall · SSH · Connections · Logs · Recommendations.
- **Features:** UFW status, SSH config view, log viewer, privacy dashboard.

### Horus Lab — ready-made AI & robotics projects *(roadmap v0.2+)*
- **Purpose:** a guided gallery of complete projects to learn from.
- **Screens:** Project gallery · Step-by-step build · Run/upload.

### Horus Store — apps/templates/components *(roadmap v0.5+)*
- **Purpose:** install apps, project templates, and hardware component profiles.
- **Screens:** Browse · Categories · Detail · Installed.

### Horus Docs — offline bilingual documentation
- **Purpose:** learn without internet, in Arabic & English.
- **Screens:** Library · Tutorial · Search · Cheat-sheets.

### Horus Terminal — themed terminal
- **Purpose:** a friendly, branded terminal with helpful commands.
- **Features:** HORUS theme, welcome banner, `horus-help`, fastfetch.

### Horus Backup — project backup manager *(roadmap v0.5+)*
- **Purpose:** one-click backup/restore of `~/HorusProjects`.

### Horus Update — update manager *(roadmap v0.5+)*
- **Purpose:** safe system + HORUS-app updates with rollback notes.

### Horus Browser — native web browser
- **Purpose:** the OS's own browser + the shell for HORUS web apps (`--app`).
- **Features:** tabs, branded start page, dark gold theme, app mode.

## 7. Realistic tech stack

| Layer | Choice |
|---|---|
| Base distro | Ubuntu 22.04 LTS (Jammy) minimal via debootstrap |
| Desktop | GNOME Shell (Mutter) + Yaru-dark + dconf branding |
| Display manager | GDM3 (Wayland), dark greeter, live autologin |
| Boot | GRUB2 (HORUS theme) + Plymouth (HORUS splash) |
| Package mgmt | APT (+ snap where it makes sense) |
| App backends | Python 3 + FastAPI + psutil/pyserial |
| App frontends | React + Tailwind (built at ISO time) → self-contained HTML fallback |
| Browser/app shell | Python + GTK3 + WebKit2GTK |
| Local AI | Ollama + Mistral 7B; OpenAI fallback |
| ISO build | debootstrap → chroot customize → mksquashfs → xorriso (BIOS+UEFI hybrid) |
| Live/installer | casper live boot; Ubiquity-style install (roadmap) |
| CI/CD | GitHub Actions builds & releases the ISO on tag |

## 8. Security model

- **Defensive posture only.** UFW deny-incoming by default; SSH hardened.
- Live user has passwordless sudo for demo convenience — **the installer will
  prompt to set a real password and disable autologin** (roadmap).
- No offensive tooling preinstalled. nmap is for learning networking, not a
  "hacking distro." This positioning is deliberate and kept clean.

## 9. GitHub repository structure

```
horus-os/
├── README.md                Overview + quick start
├── ROADMAP.md               MVP → multi-year plan
├── apps/                    First-party apps (backends + frontends)
│   ├── horus-control-center/  (Horus Center)
│   ├── horus-robotics/
│   ├── horus-ai-assistant/    (Horus AI)
│   ├── horus-security-center/
│   ├── horus-demo-mode/
│   ├── horus-about/
│   └── horus-browser/
├── templates/               One-click project templates
├── scripts/                 build-iso.sh, install-packages.sh, branding,
│                            horus-setup.sh, horus-doctor.sh
├── configs/                 os-release, gnome dconf, systemd, fastfetch
├── branding/                logo, wallpapers, plymouth, grub-theme, palette
├── vm/                      VMware/VirtualBox/QEMU run files
├── docs/                    PRODUCT, DESIGN-SYSTEM, PITCH, PROMPTS, guides
├── website/                 Landing site
└── .github/workflows/       ISO build & release
```

See [ROADMAP.md](../ROADMAP.md) · [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) ·
[PITCH.md](PITCH.md) · [PROMPTS.md](PROMPTS.md).
