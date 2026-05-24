#!/bin/bash
# HORUS OS — boot the ISO in QEMU/KVM (fastest way to test a build).
#
# Usage:
#   ./run-qemu.sh path/to/horus-os-1.0.0-amd64.iso          # live boot
#   ./run-qemu.sh horus.iso --install                       # + 30G disk to install onto
#
# Needs: qemu-system-x86 (sudo apt install qemu-system-x86 ovmf)
set -euo pipefail

ISO="${1:-}"
[[ -f "$ISO" ]] || { echo "Usage: $0 <horus-os.iso> [--install]"; exit 1; }

RAM="${HORUS_VM_RAM:-8192}"
CPUS="${HORUS_VM_CPUS:-4}"
DISK="horus-os-disk.qcow2"

ACCEL=()
[[ -e /dev/kvm ]] && ACCEL=(-enable-kvm -cpu host) || echo "KVM not available — running (slower) emulation."

UEFI=()
for f in /usr/share/OVMF/OVMF_CODE.fd /usr/share/ovmf/OVMF.fd; do
  [[ -f "$f" ]] && { UEFI=(-bios "$f"); break; }
done

DISK_ARGS=()
if [[ "${2:-}" == "--install" ]]; then
  [[ -f "$DISK" ]] || qemu-img create -f qcow2 "$DISK" 30G
  DISK_ARGS=(-drive file="$DISK",if=virtio,format=qcow2)
  echo "Install disk: $DISK (30G)"
fi

exec qemu-system-x86_64 \
  "${ACCEL[@]}" "${UEFI[@]}" \
  -m "$RAM" -smp "$CPUS" \
  -machine q35 \
  -device virtio-vga-gl -display gtk,gl=on \
  -device qemu-xhci -device usb-tablet \
  -netdev user,id=net0 -device virtio-net,netdev=net0 \
  -drive file="$ISO",media=cdrom \
  "${DISK_ARGS[@]}" \
  -boot menu=on \
  -name "HORUS OS"
