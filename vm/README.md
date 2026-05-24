# Running HORUS OS in a Virtual Machine

Three ways to boot the HORUS OS ISO. Recommended VM specs: **4 CPUs, 8 GB RAM,
3D acceleration on, 30 GB disk** (GNOME Shell wants a little muscle).

> Get the ISO from the GitHub Releases page, or build it with
> `sudo scripts/build-iso.sh`. The output is `dist/horus-os-1.0.0-amd64.iso`.

## QEMU/KVM — fastest for testing (Linux)
```bash
sudo apt install qemu-system-x86 ovmf
vm/run-qemu.sh dist/horus-os-1.0.0-amd64.iso            # live boot
vm/run-qemu.sh dist/horus-os-1.0.0-amd64.iso --install  # + 30G disk to install onto
```

## VMware Workstation / Player
1. Copy `vm/horus-os.vmx` and the ISO into the same folder.
2. Rename the ISO to `horus-os-1.0.0-amd64.iso` (or edit the `.vmx`).
3. **Open a Virtual Machine** → pick `horus-os.vmx` → **Play**.
4. To install: VM settings → **Add → Hard Disk → 30 GB**, then uncomment the
   `scsi0` lines in the `.vmx`.

## VirtualBox (automated)
```bash
vm/create-virtualbox-vm.sh dist/horus-os-1.0.0-amd64.iso
VBoxManage startvm "HORUS OS"
```

## Login
- **User:** `horus-user` · **Password:** `horus2024`
- The live session auto-logs in to the desktop.

## Tips
- Enable **USB passthrough** to plug an Arduino/ESP32 into HORUS Robotics.
- If the screen is black on boot, choose **Safe Mode (nomodeset)** in GRUB.
