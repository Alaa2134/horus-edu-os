# HORUS OS — Build Guide

> Step-by-step instructions for building a bootable HORUS OS ISO from source.

---

## Prerequisites

### Build Machine Requirements
- **OS:** Ubuntu 22.04 LTS (the build machine must be Ubuntu 22.04 for package compatibility)
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk:** 15 GB free minimum
- **Internet:** Required for package download during build

### Install Build Dependencies
```bash
sudo apt-get update
sudo apt-get install -y \
  debootstrap squashfs-tools xorriso \
  grub-pc-bin grub-efi-amd64-bin \
  mtools dosfstools isolinux \
  git curl wget
```

---

## Quick Build

```bash
# 1. Clone the repository
git clone https://github.com/alaasaber/horus-os
cd horus-os

# 2. Make scripts executable
chmod +x scripts/*.sh

# 3. Run the build (takes 45–90 minutes)
sudo scripts/build-iso.sh

# 4. Find your ISO at:
ls -lh dist/horus-os-1.0.0-amd64.iso
```

---

## Build Options

```bash
# Custom architecture (default: amd64)
sudo ARCH=arm64 scripts/build-iso.sh

# Skip package reinstall (use cached chroot)
sudo SKIP_PACKAGES=true scripts/build-iso.sh

# Custom output directory
sudo scripts/build-iso.sh --output /tmp/horus-build
```

---

## Step-by-Step Manual Build

If you want to understand or customize each step:

### Step 1: Bootstrap Ubuntu Base
```bash
sudo mkdir -p build/chroot
sudo debootstrap \
  --arch=amd64 \
  --include=systemd,systemd-sysv,sudo,locales,curl,wget,gnupg2,ca-certificates \
  jammy \
  build/chroot \
  http://archive.ubuntu.com/ubuntu/
```

### Step 2: Prepare Chroot
```bash
# Mount pseudo-filesystems
sudo mount --bind /dev build/chroot/dev
sudo mount devpts build/chroot/dev/pts -t devpts -o gid=5,mode=620
sudo mount proc build/chroot/proc -t proc
sudo mount sysfs build/chroot/sys -t sysfs
sudo mount tmpfs build/chroot/run -t tmpfs -o mode=755,nosuid,nodev

# Network access
sudo cp /etc/resolv.conf build/chroot/etc/resolv.conf
```

### Step 3: Install Packages
```bash
sudo scripts/install-packages.sh build/chroot
```

### Step 4: Apply HORUS Branding
```bash
sudo scripts/setup-branding.sh build/chroot $(pwd)
```

### Step 5: Install Custom Apps
```bash
sudo mkdir -p build/chroot/opt/horus
sudo cp -r apps/. build/chroot/opt/horus/
```

### Step 6: Configure Services
```bash
sudo scripts/setup-services.sh build/chroot
```

### Step 7: Create Live User
```bash
sudo scripts/create-user.sh build/chroot horus-user horus2024 $(pwd)
```

### Step 8: Clean Up Chroot
```bash
sudo umount build/chroot/dev/pts
sudo umount build/chroot/proc
sudo umount build/chroot/sys
sudo umount build/chroot/dev
sudo umount build/chroot/run
```

### Step 9: Build ISO
```bash
# Create squashfs
sudo mkdir -p build/iso/casper
sudo mksquashfs build/chroot build/iso/casper/filesystem.squashfs \
  -comp xz -Xbcj x86 -b 1M -noappend \
  -e boot proc sys dev run

# Copy kernel
sudo cp build/chroot/vmlinuz build/iso/casper/vmlinuz
sudo cp build/chroot/initrd.img build/iso/casper/initrd

# Create ISO
sudo xorriso -as mkisofs \
  -iso-level 3 \
  -full-iso9660-filenames \
  -volid "HORUS_OS_1.0.0" \
  -output dist/horus-os-1.0.0-amd64.iso \
  build/iso
```

---

## Using Cubic (GUI Alternative — Fastest Path)

**Cubic** is a GUI tool for customizing Ubuntu live ISOs. Fastest for beginners.

```bash
# Install Cubic on Ubuntu 22.04
sudo apt-add-repository ppa:cubic-wizard/release
sudo apt-get update
sudo apt-get install cubic

# Launch Cubic
cubic
```

**In Cubic:**
1. Select Ubuntu 22.04 LTS minimal ISO as base
2. In the chroot terminal, run: `bash /path/to/scripts/install-packages.sh /`
3. Copy branding files manually via Files tab
4. Generate the custom ISO

---

## Flashing the ISO

### Linux
```bash
# Find your USB drive
lsblk

# Flash (replace /dev/sdX with your USB device)
sudo dd if=dist/horus-os-1.0.0-amd64.iso of=/dev/sdX bs=4M status=progress && sync
```

### Windows
- Use **Balena Etcher** (recommended): https://etcher.balena.io
- Or **Rufus**: https://rufus.ie — select GPT, UEFI mode

### macOS
```bash
diskutil list  # Find your USB
diskutil unmountDisk /dev/diskN
sudo dd if=horus-os-1.0.0-amd64.iso of=/dev/rdiskN bs=1m && sync
```

---

## Build Troubleshooting

### "debootstrap failed"
```bash
# Usually a network issue — test mirror
curl -I http://archive.ubuntu.com/ubuntu/

# Try a local mirror
sudo debootstrap --mirror=http://mirrors.ubuntu.com/mirrors.txt ...
```

### "No space left on device"
```bash
df -h  # Check disk space — need 15 GB free
# Clean previous build
sudo rm -rf build/
```

### "mksquashfs takes too long"
```bash
# Use faster compression (larger ISO)
sudo mksquashfs build/chroot build/iso/casper/filesystem.squashfs \
  -comp lz4 -Xhc -b 1M -noappend -e boot proc sys dev run
```

### "Plymouth not showing"
Check kernel cmdline has `quiet splash`:
```bash
grep CMDLINE /etc/default/grub
# Should contain: GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
```

### "Custom apps won't start"
```bash
# Check the systemd service status
sudo systemctl status horus-control-center.service

# View logs
sudo journalctl -u horus-control-center.service -f
```

---

## Build Directory Structure After Build

```
build/
├── chroot/          Complete Ubuntu rootfs with HORUS customizations
│   ├── etc/os-release          HORUS identity
│   ├── opt/horus/              Custom applications
│   ├── usr/share/plymouth/     Boot splash
│   └── boot/grub/themes/       GRUB theme
├── iso/
│   ├── casper/
│   │   ├── filesystem.squashfs  Compressed OS (~2.5 GB)
│   │   ├── vmlinuz              Linux kernel
│   │   └── initrd               Initial ramdisk
│   └── boot/grub/              GRUB configuration
└── dist/
    ├── horus-os-1.0.0-amd64.iso    Final bootable ISO
    └── horus-os-1.0.0-amd64.iso.sha256
```

---

## Running HORUS OS in a VM (Testing)

```bash
# Install QEMU
sudo apt-get install -y qemu-system-x86 qemu-kvm

# Boot the ISO in QEMU
qemu-system-x86_64 \
  -m 4G \
  -smp 2 \
  -cdrom dist/horus-os-1.0.0-amd64.iso \
  -boot d \
  -vga virtio \
  -display gtk,gl=on
```

Or use **VirtualBox** or **VMware Workstation** with the ISO file.

---

## Estimated Build Times

| Step | Time |
|------|------|
| debootstrap | 5–10 min |
| Package install | 15–30 min |
| Branding setup | 2–5 min |
| App installation | 5–10 min |
| mksquashfs | 15–25 min |
| xorriso ISO | 2–5 min |
| **Total** | **45–90 min** |

Times vary based on internet speed and machine performance.
