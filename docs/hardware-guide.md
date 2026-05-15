# HORUS OS — Hardware Guide

> Compatibility, requirements, and embedded hardware setup for HORUS OS.

---

## Supported Platforms

| Platform | Architecture | Status | Notes |
|----------|-------------|--------|-------|
| x86_64 PC / Laptop | amd64 | ✅ Primary | Full feature support |
| Raspberry Pi 4 (4 GB+) | ARM64 | ✅ Supported | GPIO, I2C, UART work natively |
| Raspberry Pi 3B+ | ARM64 | ⚠ Partial | May be slow; 1 GB RAM is tight |
| x86_64 Virtual Machine | amd64 | ✅ Tested | VirtualBox, VMware, QEMU |
| Generic ARM64 SBC | ARM64 | 🔬 Experimental | Boot may vary by bootloader |

---

## Minimum Hardware Requirements

```
CPU:     x86_64 dual-core 1.5 GHz  (or ARM Cortex-A72 for RPi4)
RAM:     2 GB  (4 GB recommended for AI features)
Storage: 10 GB  (20 GB recommended)
Display: 1280×720 (HDMI or DisplayPort)
Network: Ethernet or WiFi (for package updates)
```

---

## Tested Embedded Laptops

HORUS OS is optimized for embedded development laptops:

| Make/Model | Notes |
|------------|-------|
| Generic Intel Core i5/i7 laptop | Full support |
| Laptop with NVIDIA dGPU | Use `nouveau` driver; proprietary driver optional |
| Laptop with Intel HD/UHD Graphics | Native KMS, Picom works |
| Laptop with AMD Radeon | Native AMD kernel driver |
| Laptop with Realtek WiFi | May need `rtl8821ce` dkms module |

---

## Raspberry Pi 4 Setup

### Building the ARM64 ISO

```bash
# On your Ubuntu 22.04 build machine:
sudo ARCH=arm64 scripts/build-iso.sh
# Output: dist/horus-os-1.0.0-arm64.img
```

### Flashing to MicroSD

```bash
# Linux
sudo dd if=dist/horus-os-1.0.0-arm64.img of=/dev/sdX bs=4M status=progress && sync

# Windows — use Raspberry Pi Imager or Balena Etcher
```

### RPi4 GPIO Pinout

```
Physical Pin  BCM GPIO  Function
─────────────────────────────────
Pin 3         GPIO 2    I2C SDA
Pin 5         GPIO 3    I2C SCL
Pin 8         GPIO 14   UART TX
Pin 10        GPIO 15   UART RX
Pin 11        GPIO 17   General output
Pin 12        GPIO 18   PWM0
Pin 13        GPIO 27   General output
Pin 15        GPIO 22   General output
Pin 19        GPIO 10   SPI MOSI
Pin 21        GPIO 9    SPI MISO
Pin 23        GPIO 11   SPI CLK
Pin 24        GPIO 8    SPI CE0
```

---

## GPIO Control — Python Examples

### Enable I2C on Raspberry Pi

```bash
# In HORUS terminal:
sudo raspi-config
# Interface Options → I2C → Enable
# Or manually:
sudo sh -c 'echo "dtparam=i2c_arm=on" >> /boot/config.txt'
sudo reboot
```

### Basic GPIO Output

```python
import gpiod

chip = gpiod.Chip('gpiochip0')
line = chip.get_line(17)          # GPIO 17 = physical pin 11
line.request(consumer='horus', type=gpiod.LINE_REQ_DIR_OUT)
line.set_value(1)                 # HIGH
import time; time.sleep(1)
line.set_value(0)                 # LOW
line.release()
```

### GPIO Input with Pullup

```python
import gpiod

chip = gpiod.Chip('gpiochip0')
line = chip.get_line(22)
line.request(
    consumer='horus',
    type=gpiod.LINE_REQ_DIR_IN,
    flags=gpiod.LINE_REQ_FLAG_BIAS_PULL_UP
)
print("Button:", line.get_value())   # 1 = not pressed, 0 = pressed
line.release()
```

---

## I2C Devices

### Scan for I2C Devices

```bash
# Enable I2C (Raspberry Pi)
sudo modprobe i2c-dev

# Scan bus 1
sudo i2cdetect -y 1
```

### Read I2C Sensor (e.g., BMP280 pressure sensor)

```python
import smbus2
import struct

bus = smbus2.SMBus(1)       # I2C bus 1
addr = 0x76                  # BMP280 default address

# Read chip ID
chip_id = bus.read_byte_data(addr, 0xD0)
print(f"BMP280 chip ID: 0x{chip_id:02X}")  # Should be 0x60

# Read raw temperature (registers 0xFA-0xFC)
raw = bus.read_i2c_block_data(addr, 0xFA, 3)
temp_raw = (raw[0] << 12) | (raw[1] << 4) | (raw[2] >> 4)
print(f"Raw temp ADC: {temp_raw}")
```

---

## UART / Serial

### List Serial Ports

```bash
ls /dev/tty*
# Arduino usually shows as /dev/ttyACM0 or /dev/ttyUSB0
# RPi UART: /dev/ttyAMA0 or /dev/ttyS0
```

### Serial Monitor (minicom)

```bash
# Connect to Arduino Uno at 9600 baud
minicom -D /dev/ttyACM0 -b 9600

# Quit minicom: Ctrl+A then X
```

### Python Serial

```python
import serial
import time

ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
time.sleep(2)              # Wait for Arduino reset
ser.write(b'Hello\n')
response = ser.readline()
print(response.decode().strip())
ser.close()
```

---

## Arduino CLI

HORUS OS includes Arduino CLI pre-installed.

### Setup Arduino CLI

```bash
# Initialize config
arduino-cli config init

# Update index
arduino-cli core update-index

# Install Arduino AVR core (for Uno/Nano)
arduino-cli core install arduino:avr

# List connected boards
arduino-cli board list
```

### Compile and Upload

```bash
# Create a sketch
arduino-cli sketch new ~/Projects/arduino/blink

# Compile
arduino-cli compile --fqbn arduino:avr:uno ~/Projects/arduino/blink

# Upload (replace /dev/ttyACM0 with your port)
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:uno ~/Projects/arduino/blink
```

### Arduino Blink Sketch (pre-written)

```cpp
// ~/Projects/arduino/blink/blink.ino
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
```

---

## PlatformIO

```bash
# Install PlatformIO CLI
pip3 install platformio

# Create a project for Arduino Uno
mkdir ~/Projects/embedded/myproject && cd ~/Projects/embedded/myproject
pio project init --board uno

# Build
pio run

# Upload
pio run --target upload
```

---

## USB Permission Fix

If you get "Permission denied" on `/dev/ttyUSB0` or `/dev/ttyACM0`:

```bash
# Add your user to dialout group (already done for horus-user)
sudo usermod -aG dialout $USER

# Apply without logout (temporary):
newgrp dialout

# Check
ls -la /dev/ttyACM0
```

---

## Temperature Sensors (lm-sensors)

```bash
# Detect sensors (run once after install)
sudo sensors-detect --auto

# Read temperatures
sensors

# In Python:
import subprocess, re
out = subprocess.check_output(['sensors'], text=True)
# Parse temperature values from output
```

---

## WiFi Adapters

### Check WiFi Chipset

```bash
lspci | grep -i wireless
# or for USB WiFi:
lsusb | grep -i wireless
```

### Realtek RTL8821CE (Common on embedded laptops)

```bash
# Install driver
sudo apt-get install -y dkms
git clone https://github.com/tomaspinho/rtl8821ce
cd rtl8821ce
sudo ./dkms-install.sh
sudo reboot
```

### MediaTek MT7921

```bash
# Usually works out of the box on Ubuntu 22.04 kernel 5.15+
# Check:
sudo dmesg | grep mt7921
```

---

## Power Management

```bash
# View battery status
cat /sys/class/power_supply/BAT0/capacity
cat /sys/class/power_supply/BAT0/status

# Set CPU governor via HORUS Control Center
# Or manually:
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Check current governor
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
```

---

## Hardware Compatibility Matrix

| Feature | x86_64 | RPi4 |
|---------|--------|------|
| XFCE4 Desktop | ✅ | ✅ |
| Control Center | ✅ | ✅ |
| AI Assistant | ✅ (Ollama) | ⚠ (slow) |
| GPIO Control | ❌ (no GPIO) | ✅ |
| I2C | Depends on board | ✅ |
| UART/Serial | ✅ (USB-Serial) | ✅ (native) |
| Arduino CLI | ✅ | ✅ |
| Camera (V4L2) | ✅ (USB webcam) | ✅ |
| Bluetooth | ✅ | ✅ |
| WiFi | ✅ | ✅ (built-in) |
