# HORUS OS — Roadmap

From a small, honest Alpha to a stable, community-driven distribution — and a
multi-year vision beyond. Dates are intentionally omitted; we ship by milestone.

Legend: ✅ done · 🚧 in progress · ⬜ planned

---

## What's left to be "world-class" (honest gap analysis)

We have the foundation, identity, apps, tooling, VM files, docs and CI. To be a
distribution people trust and adopt worldwide, these gaps must close — in order:

| # | Gap | Why it matters | Status |
|---|-----|----------------|--------|
| 1 | **A verified bootable ISO** | Nothing is "real" until it builds and boots to the desktop. | 🚧 needs a CI build run + fixes |
| 2 | **A real installer** (Calamares) | World-class distros install to disk, set a real password, disable autologin. | ⬜ |
| 3 | **Live data in every app** | Apps must show real system/board data, not demo content. | 🚧 |
| 4 | **Horus AI depth** | Local model manager + error explainer = the headline feature. | ⬜ |
| 5 | **Store / Docs / Backup / Update / Lab** | The rest of the app suite. | ⬜ |
| 6 | **Quality engineering** | Hardware test matrix, signed + checksummed releases, reproducibility. | 🚧 (CI lint done) |
| 7 | **Real raster visuals** | Polished 4K wallpapers, screenshots, full icon set, gold shell theme. | ⬜ |
| 8 | **Complete localization** | Full Arabic UI + offline bilingual tutorial content. | ⬜ |
| 9 | **Performance & footprint** | Boot time, ISO size, RAM usage targets. | ⬜ |
| 10 | **Live website + community** | Downloads, tutorials, videos, Discord/Telegram, ambassadors. | 🚧 (site exists) |

**Acceptance bar for "world-class 1.0":** a signed ISO that boots to the
branded GNOME desktop in a VM and on ≥3 real laptops; installs to disk with a
proper user; every app opens with live data; `horus-setup`/`horus-doctor` work;
Arabic + English throughout; a public website with tutorials and an active
community; reproducible CI builds with checksums.

---

## Execution plan (quarter by quarter)

> Cadence is indicative; we ship by milestone, not by date. Each quarter ends
> with a tagged release and a short demo video.

**Q1 — Make it boot & install (targets v0.3–v0.5)**
- Run the CI ISO build; fix package names, casper live boot, autologin.
- Add the **Calamares installer** with HORUS branding; set real password,
  disable autologin, enable UFW post-install.
- Wire **live data** into Center/Robotics/AI/Security (build React or live demo).
- Acceptance: ISO boots in QEMU/VMware/VirtualBox **and** installs to disk.

**Q2 — Depth & the app suite (v0.5–v0.7)**
- **Horus AI:** Ollama auto-wire + model manager UI + error explainer.
- **Horus Robotics:** in-browser serial monitor dashboard.
- **Horus Store / Docs / Backup / Update / Lab** v1.
- Acceptance: every dock app does something genuinely useful, offline.

**Q3 — Polish & quality (v0.8–v0.9 Beta)**
- Real 4K wallpapers + screenshots + full icon set + gold GNOME shell theme.
- Hardware test matrix (Intel/AMD/NVIDIA, 3+ laptops); fix regressions.
- Signed releases + checksums; reproducible build; ISO size/boot-time budget.
- Acceptance: Beta usable as a daily lab OS; no blocker bugs.

**Q4 — Launch 1.0**
- Stable release, release notes, signed ISO on the website.
- Tutorials (AR/EN) + launch video; Discord/Telegram; university pilot(s).
- Ambassador program + competition demos.
- Acceptance: the "world-class 1.0" bar above is met.

**Year 2+** — Store marketplace, AI project generator, ARM64/Raspberry Pi,
classroom/fleet management, HORUS APT repo, certification track (see vision below).

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
