# HORUS OS — Installation Guide

> Install HORUS OS on a physical machine or virtual machine in under 10 minutes.

---

## Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 2 GB | 4 GB |
| Storage | 10 GB | 20 GB |
| CPU | x86_64 dual-core | x86_64 quad-core |
| USB Drive | 4 GB (for live USB) | 8 GB |
| Display | 1280×720 | 1920×1080 |

> **Raspberry Pi 4:** Use the ARM64 build. See [hardware-guide.md](hardware-guide.md).

---

## Step 1 — Download the ISO

```bash
# From the GitHub releases page:
wget https://github.com/alaasaber/horus-os/releases/download/v1.0.0/horus-os-1.0.0-amd64.iso

# Verify checksum
sha256sum horus-os-1.0.0-amd64.iso
# Expected: matches horus-os-1.0.0-amd64.iso.sha256
```

Or **build from source** — see [build-guide.md](build-guide.md).

---

## Step 2 — Flash to USB

### Windows (Recommended — Balena Etcher)
1. Download [Balena Etcher](https://etcher.balena.io)
2. Select `horus-os-1.0.0-amd64.iso`
3. Select your USB drive (8 GB or larger)
4. Click **Flash!** — wait ~5 minutes

### Windows (Rufus)
1. Download [Rufus](https://rufus.ie)
2. Device: your USB drive
3. Boot selection: `horus-os-1.0.0-amd64.iso`
4. Partition scheme: **GPT**
5. Target system: **UEFI (non CSM)**
6. Click **START**

### Linux
```bash
# Identify your USB device (e.g., /dev/sdb — NOT your hard drive!)
lsblk

# Flash
sudo dd if=horus-os-1.0.0-amd64.iso of=/dev/sdX bs=4M status=progress && sync
```

### macOS
```bash
diskutil list
diskutil unmountDisk /dev/diskN
sudo dd if=horus-os-1.0.0-amd64.iso of=/dev/rdiskN bs=1m && sync
```

---

## Step 3 — Boot from USB

1. Insert the USB drive
2. Restart your computer
3. Enter the **boot menu** (usually F12, F10, F8, or Esc during startup)
4. Select your USB drive
5. HORUS OS will boot into the live environment

> **UEFI / Secure Boot:** If you see a Secure Boot error, disable Secure Boot in BIOS settings. HORUS OS does not require Secure Boot but is compatible when disabled.

---

## Step 4 — Try or Install

When HORUS OS boots, you have two options:

### A) Try HORUS OS (Live Mode)
- HORUS OS runs entirely from USB — nothing is written to your disk
- All custom apps are available
- Changes do not persist after reboot

### B) Install HORUS OS to Disk
1. Double-click the **Install HORUS OS** icon on the desktop
2. The **Ubiquity installer** will launch
3. Follow the installation wizard:

```
Language → English (or Arabic)
     ↓
Keyboard Layout → Your layout
     ↓
Installation Type:
  • Erase disk and install HORUS OS  (simplest)
  • Something else  (manual partitioning — for dual-boot)
     ↓
Timezone → Your location
     ↓
User → Full name, username, password
     ↓
Install! (15–30 minutes)
```

4. When prompted, remove the USB drive and press Enter to reboot
5. HORUS OS will boot from your hard drive

---

## Step 5 — First Boot Setup

After installation, on first boot:

```bash
# 1. Update the system
sudo apt-get update && sudo apt-get upgrade -y

# 2. Start HORUS Control Center (auto-starts by default)
sudo systemctl status horus-control-center

# 3. Install Ollama for AI (optional but recommended)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull mistral

# 4. Start HORUS AI
sudo systemctl enable --now horus-ai

# 5. Open HORUS Control Center in Chromium
chromium http://localhost:8420
```

---

## Default Login

| Field | Value |
|-------|-------|
| Username | `horus-user` |
| Password | `horus2024` |
| Root | Passwordless sudo (no root password needed) |

> **Change the password after first login:**
> ```bash
> passwd horus-user
> ```

---

## App Access

After boot, all HORUS apps are accessible:

| App | How to Open |
|-----|------------|
| Control Center | Chromium → `http://localhost:8420` or desktop icon |
| AI Assistant | Chromium → `http://localhost:8421` or desktop icon |
| Security Center | Chromium → `http://localhost:8422` (localhost only) |
| About HORUS OS | Open `apps/horus-about/index.html` in Chromium |
| Demo Mode | Chromium → `http://localhost:8423` (fullscreen F11) |

---

## Dual Boot (Windows + HORUS OS)

1. In Windows, shrink your C: partition (Disk Management → Shrink Volume)
   - Leave at least 20 GB for HORUS OS
2. Boot HORUS OS from USB
3. Select **Something else** in the installer
4. Create partitions:
   - `/` (root) — ext4 — at least 15 GB
   - `/home` — ext4 — remaining space
   - swap — 2×RAM (optional)
5. Select bootloader device: your main disk (e.g., `/dev/sda`)
6. Install

GRUB will detect Windows and add it to the boot menu automatically.

---

## Troubleshooting

### "No bootable device found"
- Make sure UEFI Secure Boot is **disabled**
- Check that USB is set as first boot device
- Try re-flashing the USB with Rufus (GPT/UEFI mode)

### Black screen after boot
```bash
# Add nomodeset to GRUB at boot:
# In GRUB menu, press 'e', find 'quiet splash', add 'nomodeset' after it
# Then press F10 to boot
```

### HORUS apps not starting
```bash
sudo systemctl status horus-control-center.service
sudo journalctl -u horus-control-center -n 50
# Ensure Python dependencies: pip3 install -r /opt/horus/horus-control-center/backend/requirements.txt
```

### No internet
```bash
nmcli device status
nmcli device wifi list
nmcli device wifi connect "YourSSID" password "YourPassword"
```

### Arabic/RTL not displaying correctly
```bash
# Install Arabic fonts
sudo apt-get install -y fonts-noto-core fonts-noto-arabic
# Log out and back in
```

---

## Uninstall

To remove HORUS OS from a dual-boot setup:
1. Boot into Windows
2. Run `bootrec /fixmbr` in cmd as Administrator to restore Windows bootloader
3. Delete the HORUS OS partition in Disk Management
4. Extend your Windows partition to reclaim the space
