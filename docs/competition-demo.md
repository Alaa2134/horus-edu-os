# HORUS OS — Competition Demo Script

> Live demonstration guide for judges. Follow this script for a smooth, impressive demo.
> Total demo time: 5–7 minutes (adjustable).

---

## Before the Demo

### Setup Checklist (15 minutes before)

- [ ] HORUS OS booted and on desktop
- [ ] Chromium open in background tabs: `localhost:8420`, `localhost:8421`, `localhost:8423`
- [ ] Terminal open (Ctrl+Alt+T)
- [ ] Arduino board connected (if available)
- [ ] `horus-control-center` service running: `systemctl status horus-control-center`
- [ ] `horus-ai` service running: `systemctl status horus-ai`
- [ ] Fastfetch ready in terminal
- [ ] Demo Mode (localhost:8423) ready to go fullscreen

---

## Demo Script

---

### 🔵 OPENING (30 seconds)

> **Say:**
> "This is HORUS OS — a complete, custom Linux-based operating system I designed and built from scratch for embedded systems and AI education."
>
> "It boots from a USB drive, installs to any laptop, and includes five original applications. Let me show you."

**Action:** Point to the desktop. Show the custom wallpaper and taskbar.

---

### 🟡 SECTION 1 — Boot Identity (45 seconds)

**Action:** Open a terminal (Ctrl+Alt+T)

```bash
fastfetch
```

> **Say:**
> "This is HORUS OS — you can see the custom ASCII logo, and all system info: OS name, kernel version, CPU, memory, and disk — all branded with HORUS identity."

```bash
cat /etc/os-release
```

> **Say:**
> "This is not Ubuntu renamed. The OS identity is fully customized at the kernel level — it reports HORUS OS version 1.0.0."

---

### 🟡 SECTION 2 — Control Center (90 seconds)

**Action:** Switch to Chromium tab: `http://localhost:8420`

> **Say:**
> "This is the HORUS Control Center — a real-time system monitoring dashboard I built with Python FastAPI and React."
>
> "It reads live data from the /proc and /sys kernel interfaces — CPU per core, RAM usage, disk I/O, network traffic, temperatures, and battery."

**Action:** Click each page in the sidebar: CPU, Memory, Storage, Network.

> **Say:**
> "Every number here is live. This chart updates every second. The backend is a Python FastAPI server running at port 8420."

**Action:** Click **Performance Mode → Performance**

> **Say:**
> "We can even switch the CPU governor in real-time — from balanced to performance mode — directly from this dashboard."

**Action:** Click **Export Report**

> **Say:**
> "And export the full system report as JSON — useful for diagnostics."

---

### 🟡 SECTION 3 — AI Assistant (90 seconds)

**Action:** Switch to Chromium tab: `http://localhost:8421`

> **Say:**
> "This is HORUS AI — a built-in conversational assistant that knows this machine's hardware."

**Action:** Type in chat:

```
What CPU is installed in this machine?
```

> **Say:**
> "It's not just generic AI — it injects the actual hardware data into every conversation. The AI knows the CPU model, RAM amount, and OS version of this specific machine."

**Action:** Type:

```
How do I read a temperature sensor with Python on this OS?
```

> **Say:**
> "It can answer embedded systems questions with code examples. This works completely offline using Ollama with the Mistral 7B model — no internet required. Perfect for competition environments."

**Action:** Switch mode to **Engineer** using the mode buttons.

> **Say:**
> "There are four modes: Student for beginners, Engineer for technical depth, Debug for diagnostics, and Demo mode for presentations like this one."

---

### 🟡 SECTION 4 — Embedded Hardware (60 seconds)

**Action:** Return to terminal.

```bash
arduino-cli board list
```

> **Say:**
> "Arduino CLI is pre-installed. When an Arduino is connected, it appears here immediately — no configuration needed."

```bash
python3 -c "import gpiod; print('GPIO library version:', gpiod.__version__)"
```

> **Say:**
> "libgpiod is installed for GPIO control. On a Raspberry Pi 4, this controls hardware pins directly."

```bash
python3 -c "
import psutil
cpu = psutil.cpu_percent(interval=1, percpu=True)
print('Per-core CPU:', cpu)
mem = psutil.virtual_memory()
print(f'RAM: {mem.used//1024//1024} MB used / {mem.total//1024//1024} MB total')
"
```

> **Say:**
> "Python psutil works out of the box. This is the same data feeding the Control Center dashboard in real-time."

---

### 🟡 SECTION 5 — Demo Mode (60 seconds)

**Action:** Switch to Chromium tab: `http://localhost:8423` → press F11 (fullscreen)

> **Say:**
> "This is HORUS Demo Mode — a full-screen kiosk presentation I built specifically for competitions. It tells the complete story of HORUS OS with live system statistics pulled from the Control Center API."

**Action:** Scroll through sections (or let it auto-advance).

> **Say:**
> "It's fully bilingual — click the language toggle for Arabic."

**Action:** Click the AR button.

> **Say:**
> "Full right-to-left Arabic layout. The entire OS supports Arabic — the boot screen, GRUB menu, and all applications."

**Action:** Press Esc, switch back to desktop.

---

### 🔵 CLOSING (30 seconds)

> **Say:**
> "To summarize: HORUS OS is a complete, installable operating system — not a theme, not a virtual machine. It boots from a USB drive, runs on real hardware, and includes five custom applications I wrote from scratch."
>
> "The entire system was built by one student using debootstrap, squashfs, and xorriso to create a proper bootable ISO."
>
> "It's designed for embedded students who need a professional, purpose-built environment — with offline AI, hardware tools, real-time monitoring, and competition-ready presentation built in."

---

## Backup Demo (if something fails)

If live apps fail, use screenshots from the [slides](../presentation/slides-outline.md):

| Slide | Shows |
|-------|-------|
| Slide 7 | Control Center screenshot |
| Slide 8 | AI Assistant screenshot |
| Slide 9 | Demo Mode screenshot |
| Slide 12 | Security Center |

Always have `fastfetch` and `cat /etc/os-release` ready — they prove HORUS identity without needing any services.

---

## Judge Q&A Cheat Sheet

| Question | Answer |
|----------|--------|
| "Is this just Ubuntu?" | "Ubuntu is the base — like how Android is built on Linux. HORUS OS replaces every visible layer: boot, desktop, login, all apps." |
| "Why not build a kernel?" | "The kernel is hardware abstraction. Our innovation is above the kernel — the OS identity, developer environment, and AI integration. Like how macOS uses the Darwin kernel." |
| "Could it run on real hardware?" | "It's already running on real hardware right now. This IS the real hardware." |
| "What did you write yourself?" | "Plymouth animation, GRUB theme, all 5 applications (3 FastAPI backends, 3 React frontends), the ISO build system, all configuration scripts, and the branding." |
| "How long did it take?" | "The full system was designed and built in intensive sessions totaling approximately 2–3 weeks of development time." |
| "What's the roadmap?" | "v1.1 adds full Ollama voice, v1.2 is a custom Flutter shell, v2.0 targets a custom kernel module for hardware abstraction." |

---

## Emergency Commands

```bash
# Restart all services if they crash
sudo systemctl restart horus-control-center horus-ai

# Check all HORUS services
systemctl list-units "horus-*"

# Open all apps in browser quickly
chromium http://localhost:8420 http://localhost:8421 http://localhost:8423 &

# Show OS is custom
uname -a && cat /etc/os-release | grep PRETTY

# Show custom apps exist
ls /opt/horus/

# Live CPU demo
watch -n1 "cat /proc/loadavg && free -h"
```
