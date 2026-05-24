# HORUS OS — Roadmap

From a small, honest Alpha to a stable, community-driven distribution — and a
multi-year vision beyond. Dates are intentionally omitted; we ship by milestone.

Legend: ✅ done · 🚧 in progress · ⬜ planned

---

## MVP path

### v0.1 — Alpha (foundation & identity)
- ✅ Brand identity, palette, Eye-of-Horus logo
- ✅ Pyramid wallpaper (vector, 4K)
- ✅ GNOME dark theme + dock + GDM branding (dconf)
- ✅ One-click toolchain installer (`horus-setup`)
- ✅ "Fix my environment" (`horus-doctor`)
- ✅ Native browser (Horus Browser)
- ⬜ Welcome app (first-run tour)
- 🚧 First CI ISO that boots to the branded desktop

### v0.2 — Maker core
- ✅ Horus Center (system control, live metrics)
- ✅ Horus Robotics (board auto-detect, wiring helper, scaffolding)
- ✅ Project templates (Arduino, ESP32, Python AI/ML, web, ROS 2)
- ⬜ Horus Lab v1 (guided project gallery)
- ⬜ Arduino/ESP core preseed via `horus-setup` on first run

### v0.3 — Robotics & AI depth
- ⬜ Serial monitor dashboard (live, in-browser)
- ⬜ Horus AI: local Ollama/Mistral wired by default + model manager UI
- ⬜ Error explainer (Arduino/Python/Flutter)
- ⬜ Gazebo + ROS 2 one-click lab

### v0.5 — Distributable
- 🚧 Hardened ISO: BIOS + UEFI + USB hybrid, reliable live boot
- ⬜ Live USB persistence
- ⬜ Installer (Ubiquity/Calamares) with real-password + disable-autologin
- ⬜ Horus Update (safe updates) + Horus Backup (project backup)
- ⬜ Offline bilingual docs (Horus Docs) v1
- ⬜ Horus Store v1 (templates + components)

### v1.0 — Stable release
- ⬜ Stability pass, hardware test matrix, release notes
- ⬜ Website + downloads + checksums + signed releases
- ⬜ Tutorials (Arabic + English), getting-started videos
- ⬜ Community (Discord/Telegram, GitHub Discussions)
- ⬜ University lab deployment guide

---

## Multi-year vision

### v1.x — Ecosystem
- ⬜ Horus Store marketplace with community templates & ratings
- ⬜ AI project generator ("describe an idea → scaffold")
- ⬜ Classroom mode: teacher dashboard, push templates to lab machines
- ⬜ HORUS APT repo for first-party apps (clean, signed)

### v2.0 — Platform
- ⬜ Custom GNOME extension suite (Horus launcher, panel, workspace effects)
- ⬜ ARM64 build for Raspberry Pi 4/5 (robotics on-device)
- ⬜ Fleet/lab management (image + config for many machines)
- ⬜ Signed packages + reproducible builds

### v3.0 — Long term
- ⬜ HORUS Cloud sync for `~/HorusProjects` (optional, self-hostable)
- ⬜ On-device small LLM tuned for embedded/robotics Q&A
- ⬜ Hardware partner program (boards that "just work" out of the box)
- ⬜ Certification track: "HORUS Certified Maker / AI / Robotics"

---

## Principles
- **Honest over hype** — no impossible claims; ship what works.
- **Beginner-first** — every feature must help someone who is stuck.
- **Curate, don't fork the world** — build on Ubuntu/GNOME, add real value.
- **Bilingual by default** — Arabic and English are first-class.
- **Open source** — community can read, build, and contribute.
