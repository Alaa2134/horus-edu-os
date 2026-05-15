# HORUS OS — Competition Pitch Scripts

> Creator: Alaa Saber
> Occasion: University Competition — Embedded Systems & Student Innovation

---

## 30-Second Pitch (English)

> *Speak with confidence. Stand beside the running laptop. Have HORUS OS desktop visible.*

"HORUS OS is a custom Linux-based operating system that I designed and built from scratch — specifically for embedded laptops, AI education, and hardware control.

It runs on real hardware right here. It has a custom boot experience, a full branded desktop, five original applications including an AI assistant and a real-time control center.

What makes it different? Everything you see — the boot screen, the UI, the apps, the developer tools — I designed and coded it all. It's not a theme. It's a complete OS platform built for the next generation of embedded intelligence.

**HORUS OS — Intelligence Awakened.**"

---

## 30-Second Pitch (Arabic)

> *التحدث بثقة. الوقوف بجانب اللابتوب الذي يعمل.*

"نظام حورس هو نظام تشغيل مخصص قائم على لينكس، صممته وبنيته بالكامل — خصيصاً للحاسبات المدمجة، وتعليم الذكاء الاصطناعي، والتحكم في المعدات.

يعمل على معدات حقيقية الآن أمامكم. يحتوي على تجربة إقلاع مخصصة، سطح مكتب بهوية بصرية كاملة، وخمس تطبيقات أصلية تشمل مساعداً ذكياً ولوحة تحكم فورية.

ما الذي يميزه؟ كل شيء تراه — شاشة التمهيد، الواجهة، التطبيقات، أدوات المطورين — قمت بتصميمه وبرمجته بنفسي. إنه ليس مجرد مظهر. إنه منصة نظام تشغيل متكاملة للجيل القادم من الذكاء المدمج.

**نظام حورس — ذكاء مدمج للمستقبل.**"

---

## 2-Minute Pitch (English)

> *Walk through the demo as you speak. Boot, desktop, Control Center, terminal.*

"Good [morning/afternoon]. My name is Alaa Saber, and I'm presenting HORUS OS — a custom Linux-based operating system I built specifically for embedded laptops, AI education, and hardware control.

**The Problem:** Engineering students and embedded developers work with fragmented tools across multiple environments. There's no unified, purpose-built OS platform designed specifically for this community. Generic Linux distributions require hours of configuration before you can connect a sensor, write an Arduino sketch, or get an AI assistant running.

**My Solution:** HORUS OS. Built on Ubuntu 22.04 LTS minimal, with XFCE4 as the desktop foundation, completely transformed through custom applications, branding, and pre-configured toolchains.

Let me show you what's running on this machine right now.

*[Boot from cold — shows Plymouth splash]* — This is the custom boot animation I wrote in Plymouth script.

*[Show desktop]* — The HORUS Dark theme, custom wallpaper, and taskbar are all custom-configured.

*[Open HORUS Control Center]* — This is a real-time monitoring dashboard I built with Python FastAPI on the backend and React on the frontend. It reads CPU, RAM, disk, network, temperature, and battery — all from `/proc` and the kernel's sysfs. Live. On this machine.

*[Open terminal]* — Type `fastfetch` — it shows HORUS OS, with the custom ASCII logo I wrote.

*[Open HORUS AI]* — This is the AI assistant, running locally using Ollama with Mistral 7B. It's OS-aware. Ask it anything about this machine and it will answer with context.

**What I built:**
- Custom Plymouth boot animation
- Custom GRUB2 theme
- 5 original applications: Control Center, AI Assistant, Demo Mode, Security Center, About
- Full build pipeline (one command creates a bootable ISO)
- Arabic and English support throughout
- Pre-installed embedded development toolchain: Python, Arduino CLI, i2c-tools, GPIO

**This is not a theme. This is a custom operating system.** The `/etc/os-release` file says HORUS OS. The boot sequence says HORUS OS. The AI knows it's HORUS OS. Every component was intentionally designed.

Thank you. I'm happy to answer any questions."

---

## 2-Minute Pitch (Arabic)

"صباح / مساء الخير. أنا علاء صابر، وأقدم لكم نظام حورس — نظام تشغيل مخصص قائم على لينكس، بنيته خصيصاً لأجهزة الحاسب المدمجة، وتعليم الذكاء الاصطناعي، والتحكم في المعدات.

**المشكلة:** الطلاب والمهندسون في مجال الأنظمة المدمجة يعملون مع أدوات متفرقة في بيئات متعددة. لا توجد منصة نظام تشغيل موحدة مصممة خصيصاً لهذا المجال.

**حلي:** نظام حورس. مبني على Ubuntu 22.04 LTS، مع سطح مكتب XFCE4 كأساس، تحول تماماً من خلال تطبيقات مخصصة، هوية بصرية متكاملة، وأدوات تطوير مُهيأة مسبقاً.

دعوني أريكم ما يعمل على هذا الجهاز الآن.

*[عرض شاشة التمهيد]* — هذا هو رسم متحرك الإقلاع المخصص الذي كتبته.

*[عرض سطح المكتب]* — المظهر المخصص والخلفيات وشريط المهام مُعدّة بالكامل.

*[فتح مركز تحكم حورس]* — لوحة مراقبة فورية بنيتها بـ Python FastAPI وReact. تقرأ المعالج والذاكرة والشبكة والحرارة — مباشرة من هذا الجهاز.

*[فتح الطرفية]* — اكتب fastfetch — يظهر نظام حورس مع شعار ASCII المخصص.

**ما بنيته:**
- رسم متحرك إقلاع مخصص بـ Plymouth
- مظهر GRUB2 مخصص  
- 5 تطبيقات أصلية
- خط بناء كامل (أمر واحد يُنشئ ملف ISO)
- دعم كامل للعربية والإنجليزية
- أدوات تطوير مدمجة مُثبّتة مسبقاً

**هذا ليس مجرد مظهر. هذا نظام تشغيل مخصص.**

شكراً لكم. يسعدني الإجابة على أي أسئلة."

---

## 5-Minute Technical Explanation

> *For the technical judge panel or senior evaluators.*

### Introduction (30 seconds)
"HORUS OS is a custom Linux-based operating system I designed and implemented as a complete platform for embedded intelligence. I'll walk you through the architecture, the build pipeline, the custom applications, and what differentiates this from simply installing Ubuntu."

### System Architecture (60 seconds)
"HORUS OS has five distinct layers:

1. **Boot Layer** — GRUB2 with a custom theme I wrote in GRUB's theme format, plus Plymouth with an animation script I wrote in Plymouth's scripting language. The animation fades in the HORUS logo and shows a gold progress bar.

2. **System Layer** — Ubuntu 22.04 LTS minimal as the foundation. I used `debootstrap` to build the rootfs from scratch, then customized `/etc/os-release` with HORUS identity, set the hostname, configured locales for Arabic and English.

3. **Display Layer** — LightDM with a custom gtk-greeter theme showing the HORUS wallpaper and branded login.

4. **Desktop Layer** — XFCE4 with a custom GTK theme, Picom compositor for transparency effects, and custom wallpapers and panel configuration.

5. **Application Layer** — Five original applications, all with persistent systemd services."

### Custom Applications (90 seconds)
"Let me describe the three most technically significant apps:

**HORUS Control Center:** Backend is a FastAPI Python service on port 8420 that reads from `/proc/cpuinfo`, `/proc/meminfo`, `/proc/net/dev`, and uses `psutil` for structured access to temperature sensors, disk usage, and process lists. The frontend is React with Tailwind CSS, using Recharts for the live charts. It polls the API every 2 seconds and maintains a 30-second history for the performance graph.

**HORUS AI Assistant:** Backend is FastAPI on port 8421 with a tiered AI backend: first tries Ollama on localhost for offline inference with Mistral 7B, then falls back to OpenAI API if a key is configured, then to a rule-based offline responder using a JSON knowledge base I wrote. Each request injects live system context — CPU model, memory, OS version — so the AI can answer hardware-specific questions. Four modes (Student, Engineer, Debug, Demo) each change the system prompt personality.

**HORUS Demo Mode:** A React SPA that serves as a competition kiosk. It polls the Control Center API every 3 seconds to show live stats, includes bilingual Arabic/English toggle, and walks through the full HORUS OS story section by section."

### Build Pipeline (60 seconds)
"The entire OS is built from a single script: `scripts/build-iso.sh`. It:
1. Runs `debootstrap` to create a minimal Ubuntu 22.04 rootfs
2. Mounts pseudo-filesystems and installs packages inside the chroot
3. Applies branding: copies os-release, Plymouth theme, GRUB theme, wallpapers
4. Builds and installs the custom applications
5. Configures systemd services and LightDM
6. Creates a squashfs filesystem with `mksquashfs`
7. Packages it into a hybrid BIOS+UEFI bootable ISO with `xorriso`

The output is a single `.iso` file you can flash to USB and boot on any x86_64 machine."

### Technical Differentiation (30 seconds)
"What makes HORUS OS genuinely custom:
- The boot sequence, from GRUB to Plymouth to desktop, was hand-written
- All five applications were written from scratch — no pre-existing code
- The `/etc/os-release` is HORUS OS, recognized by all standard system tools
- The build system is reproducible: run one command on any Ubuntu 22.04 machine and get the identical ISO
- Arabic is a first-class citizen: fonts, RTL layout, and bilingual app strings"

### Closing
"HORUS OS answers the question: what does a student-built operating system platform actually look like? The answer is: professional, installable, technically deep, and purpose-built. Thank you."

---

## Judge Q&A

**Q: Is this just Ubuntu with a different theme?**
A: "No. A theme changes fonts and colors. HORUS OS changes the boot sequence, system identity, application layer, build process, developer toolchain, and AI integration. The `/etc/os-release` says HORUS OS. The Plymouth script I wrote animates the boot. The five custom apps don't exist in any other OS. The build script creates the entire system from scratch using debootstrap — it's not installing Ubuntu and reskinning it."

**Q: Why Ubuntu as the base and not build your own kernel?**
A: "Building a production-stable kernel from scratch takes years for a team. My goal was to build a complete, usable OS platform that solves real problems for embedded students — and do it as a single developer in a realistic timeframe. Ubuntu 22.04 provides the kernel, hardware compatibility, and package ecosystem. Everything above that layer — boot experience, desktop, applications, AI, toolchain — is custom. This is the same approach used by professional embedded Linux distributions like Ubuntu Core, Elementary OS, and Pop!_OS."

**Q: What hardware does it run on?**
A: "Any x86_64 laptop or mini PC. The build is tested on standard Intel/AMD hardware. I also have an ARM variant for Raspberry Pi 4. Hardware detection is handled by the Ubuntu base and the pre-installed driver packages."

**Q: Can it run real embedded projects?**
A: "Yes. Python 3.11, Arduino CLI, i2c-tools, libgpiod, minicom, and PlatformIO are pre-installed. You can connect an Arduino via USB and compile/upload from the terminal in under a minute. You can scan I2C devices with `i2cdetect`, control GPIO with Python and libgpiod, and monitor serial output with minicom — all without any additional configuration."

**Q: What's next for HORUS OS?**
A: "Version 1.1 focuses on integrating Ollama with Mistral 7B for fully offline AI. Version 1.2 replaces XFCE4 with a custom Flutter desktop shell designed specifically for HORUS. Version 2.0 introduces a custom kernel configuration, a signed APT repository, and a first-boot OEM setup wizard."

**Q: How long did this take to build?**
A: "The core system — boot, desktop, branding, and first three apps — took approximately three weeks of intensive development. The full system including documentation, build pipeline, and competition materials took four to five weeks total."
