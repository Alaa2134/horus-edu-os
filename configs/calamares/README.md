# HORUS OS — Calamares installer config

Deployed to `/etc/calamares/` by `scripts/build-iso.sh`. Launched from the live
desktop via **Install HORUS OS** (`pkexec calamares`) or `horus-install`.

- `settings.conf` — install module sequence + branding selection
- `branding/horus/` — branding.desc, slideshow (`show.qml`), logos (rendered at build)
- `modules/` — unpackfs (copies the squashfs), users, displaymanager (gdm),
  bootloader (grub), packages (remove live-only), removeuser (drop live user),
  shellprocess (post-install: disable autologin, drop passwordless sudo, enable UFW)

> **Status: WIP — needs verification in a real ISO build.** Calamares module
> options vary slightly across versions; expect to tune `unpackfs`,
> `bootloader`, and `partition` against the jammy Calamares once the ISO builds
> and boots. Tracked in [ROADMAP.md](../../ROADMAP.md) gap #2.
