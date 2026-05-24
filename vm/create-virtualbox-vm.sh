#!/bin/bash
# HORUS OS — create a VirtualBox VM and attach the ISO (fully automated).
#
# Usage: ./create-virtualbox-vm.sh path/to/horus-os-1.0.0-amd64.iso
# Needs: VirtualBox (VBoxManage on PATH)
set -euo pipefail

ISO="${1:-}"
[[ -f "$ISO" ]] || { echo "Usage: $0 <horus-os.iso>"; exit 1; }
command -v VBoxManage >/dev/null || { echo "VBoxManage not found. Install VirtualBox."; exit 1; }

VM="HORUS OS"
DISK="$HOME/VirtualBox VMs/${VM}/horus-os.vdi"

VBoxManage showvminfo "$VM" &>/dev/null && { echo "VM '$VM' already exists."; exit 1; }

echo "Creating VM: $VM"
VBoxManage createvm --name "$VM" --ostype Ubuntu_64 --register
VBoxManage modifyvm "$VM" \
  --memory 8192 --cpus 4 --vram 128 --graphicscontroller vmsvga --accelerate3d on \
  --firmware efi --nic1 nat --audio-enabled on --audiocontroller hda \
  --usb on --usbxhci on --boot1 dvd --boot2 disk

mkdir -p "$(dirname "$DISK")"
VBoxManage createmedium disk --filename "$DISK" --size 30720 --format VDI
VBoxManage storagectl "$VM" --name SATA --add sata --controller IntelAhci --portcount 2
VBoxManage storageattach "$VM" --storagectl SATA --port 0 --device 0 --type hdd --medium "$DISK"
VBoxManage storageattach "$VM" --storagectl SATA --port 1 --device 0 --type dvddrive --medium "$ISO"

echo "Done. Start it with:  VBoxManage startvm \"$VM\""
