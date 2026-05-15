"""
HORUS OS Control Center — Backend API
FastAPI service providing real-time system metrics and hardware control.
Runs on port 8420, binds to 127.0.0.1 only.
"""
from __future__ import annotations

import asyncio
import json
import os
import platform
import subprocess
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

import psutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ── App Setup ──────────────────────────────────────────────────────────
app = FastAPI(
    title="HORUS Control Center",
    description="HORUS OS System Monitoring and Control API",
    version="1.0.0",
    docs_url="/api/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve built React frontend if it exists
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")


# ── Pydantic Models ────────────────────────────────────────────────────

class SystemInfo(BaseModel):
    os_name: str
    os_version: str
    os_pretty: str
    kernel: str
    hostname: str
    arch: str
    uptime: str
    uptime_seconds: float
    boot_time: str
    creator: str
    horus_version: str


class CPUInfo(BaseModel):
    percent: float
    per_core: List[float]
    count_physical: int
    count_logical: int
    freq_current: float
    freq_min: float
    freq_max: float
    model: str
    load_avg_1: float
    load_avg_5: float
    load_avg_15: float


class MemoryInfo(BaseModel):
    total: int
    available: int
    used: int
    percent: float
    total_human: str
    used_human: str
    available_human: str
    swap_total: int
    swap_used: int
    swap_percent: float


class DiskPartition(BaseModel):
    device: str
    mountpoint: str
    fstype: str
    total: int
    used: int
    free: int
    percent: float
    total_human: str
    used_human: str
    free_human: str


class NetworkInterface(BaseModel):
    name: str
    ip_address: str
    mac_address: str
    bytes_sent: int
    bytes_recv: int
    bytes_sent_human: str
    bytes_recv_human: str
    packets_sent: int
    packets_recv: int
    is_up: bool
    speed_mbps: int


class TemperatureReading(BaseModel):
    sensor: str
    label: str
    current: float
    high: Optional[float]
    critical: Optional[float]


class BatteryInfo(BaseModel):
    percent: float
    power_plugged: bool
    time_left_seconds: Optional[int]
    time_left_human: Optional[str]
    status: str


class ProcessInfo(BaseModel):
    pid: int
    name: str
    cpu_percent: float
    memory_percent: float
    memory_rss_human: str
    status: str
    username: str


class PerformanceModeResult(BaseModel):
    mode: str
    governor: str
    applied: bool
    message: str


# ── Helper Functions ───────────────────────────────────────────────────

def _human(b: int) -> str:
    """Format bytes as human-readable string."""
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if abs(b) < 1024:
            return f"{b:.1f} {unit}"
        b //= 1024
    return f"{b:.1f} PB"


def _uptime(seconds: float) -> str:
    td = timedelta(seconds=int(seconds))
    d = td.days
    h, rem = divmod(td.seconds, 3600)
    m, _ = divmod(rem, 60)
    if d > 0:
        return f"{d}d {h}h {m}m"
    if h > 0:
        return f"{h}h {m}m"
    return f"{m}m"


def _read_os_release() -> Dict[str, str]:
    result: Dict[str, str] = {}
    for path in ("/etc/os-release", "/usr/lib/os-release"):
        try:
            with open(path) as f:
                for line in f:
                    line = line.strip()
                    if "=" in line and not line.startswith("#"):
                        k, _, v = line.partition("=")
                        result[k] = v.strip('"')
            break
        except FileNotFoundError:
            continue
    return result


def _cpu_model() -> str:
    try:
        with open("/proc/cpuinfo") as f:
            for line in f:
                if "model name" in line:
                    return line.split(":", 1)[1].strip()
    except Exception:
        pass
    return platform.processor() or "Unknown CPU"


def _run(cmd: str, timeout: int = 5) -> str:
    try:
        return subprocess.check_output(
            cmd, shell=True, text=True, timeout=timeout, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        return ""


# ── API Endpoints ──────────────────────────────────────────────────────

@app.get("/")
async def root():
    if FRONTEND_DIST.exists():
        return FileResponse(str(FRONTEND_DIST / "index.html"))
    return HTMLResponse("""
    <!DOCTYPE html><html><head>
    <title>HORUS Control Center</title>
    <style>
      body{background:#0a0a0f;color:#e8e8f0;font-family:'JetBrains Mono',monospace;
           display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
      .card{text-align:center;padding:40px;border:1px solid #c9a22740;border-radius:12px;
            background:#12121a;}
      h1{color:#c9a227;font-size:2em;margin-bottom:8px;}
      p{color:#aaaacc;margin:4px 0;}
      a{color:#00d4ff;text-decoration:none;}
    </style></head><body>
    <div class="card">
      <h1>HORUS Control Center</h1>
      <p>API running on port 8420</p>
      <p><a href="/api/docs">API Documentation →</a></p>
      <p style="margin-top:20px;color:#555577;font-size:0.85em;">
        Frontend: build with <code>npm run build</code> in frontend/
      </p>
    </div></body></html>
    """)


@app.get("/api/system", response_model=SystemInfo)
async def get_system():
    os_r = _read_os_release()
    boot = psutil.boot_time()
    uptime_s = time.time() - boot
    return SystemInfo(
        os_name=os_r.get("NAME", "HORUS OS"),
        os_version=os_r.get("VERSION_ID", "1.0.0"),
        os_pretty=os_r.get("PRETTY_NAME", "HORUS OS 1.0.0"),
        kernel=platform.release(),
        hostname=platform.node(),
        arch=platform.machine(),
        uptime=_uptime(uptime_s),
        uptime_seconds=round(uptime_s, 1),
        boot_time=datetime.fromtimestamp(boot).strftime("%Y-%m-%d %H:%M:%S"),
        creator=os_r.get("HORUS_CREATOR", "Alaa Saber"),
        horus_version=os_r.get("VERSION_ID", "1.0.0"),
    )


@app.get("/api/cpu", response_model=CPUInfo)
async def get_cpu():
    freq = psutil.cpu_freq()
    load = os.getloadavg() if hasattr(os, "getloadavg") else (0.0, 0.0, 0.0)
    return CPUInfo(
        percent=psutil.cpu_percent(interval=0.4),
        per_core=psutil.cpu_percent(interval=0.4, percpu=True),
        count_physical=psutil.cpu_count(logical=False) or 1,
        count_logical=psutil.cpu_count(logical=True) or 1,
        freq_current=round(freq.current, 1) if freq else 0.0,
        freq_min=round(freq.min, 1) if freq else 0.0,
        freq_max=round(freq.max, 1) if freq else 0.0,
        model=_cpu_model(),
        load_avg_1=round(load[0], 2),
        load_avg_5=round(load[1], 2),
        load_avg_15=round(load[2], 2),
    )


@app.get("/api/memory", response_model=MemoryInfo)
async def get_memory():
    m = psutil.virtual_memory()
    s = psutil.swap_memory()
    return MemoryInfo(
        total=m.total, available=m.available, used=m.used, percent=m.percent,
        total_human=_human(m.total),
        used_human=_human(m.used),
        available_human=_human(m.available),
        swap_total=s.total, swap_used=s.used, swap_percent=s.percent,
    )


@app.get("/api/disks", response_model=List[DiskPartition])
async def get_disks():
    result = []
    for part in psutil.disk_partitions(all=False):
        if "loop" in part.device or "snap" in part.mountpoint:
            continue
        try:
            u = psutil.disk_usage(part.mountpoint)
            result.append(DiskPartition(
                device=part.device, mountpoint=part.mountpoint, fstype=part.fstype,
                total=u.total, used=u.used, free=u.free, percent=u.percent,
                total_human=_human(u.total),
                used_human=_human(u.used),
                free_human=_human(u.free),
            ))
        except (PermissionError, OSError):
            continue
    return result


@app.get("/api/network", response_model=List[NetworkInterface])
async def get_network():
    io = psutil.net_io_counters(pernic=True)
    addrs = psutil.net_if_addrs()
    stats = psutil.net_if_stats()
    result = []
    for name, addr_list in addrs.items():
        if name == "lo":
            continue
        ip = next((a.address for a in addr_list if a.family.name == "AF_INET"), "N/A")
        mac = next((a.address for a in addr_list if a.family.name == "AF_PACKET"), "N/A")
        nic_io = io.get(name)
        nic_stat = stats.get(name)
        result.append(NetworkInterface(
            name=name, ip_address=ip, mac_address=mac,
            bytes_sent=nic_io.bytes_sent if nic_io else 0,
            bytes_recv=nic_io.bytes_recv if nic_io else 0,
            bytes_sent_human=_human(nic_io.bytes_sent) if nic_io else "0 B",
            bytes_recv_human=_human(nic_io.bytes_recv) if nic_io else "0 B",
            packets_sent=nic_io.packets_sent if nic_io else 0,
            packets_recv=nic_io.packets_recv if nic_io else 0,
            is_up=nic_stat.isup if nic_stat else False,
            speed_mbps=nic_stat.speed if nic_stat else 0,
        ))
    return result


@app.get("/api/temperatures", response_model=List[TemperatureReading])
async def get_temperatures():
    result = []
    try:
        sensors = psutil.sensors_temperatures()
        if sensors:
            for sensor_name, entries in sensors.items():
                for e in entries:
                    result.append(TemperatureReading(
                        sensor=sensor_name,
                        label=e.label or sensor_name,
                        current=e.current,
                        high=e.high,
                        critical=e.critical,
                    ))
    except (AttributeError, Exception):
        pass
    return result


@app.get("/api/battery", response_model=Optional[BatteryInfo])
async def get_battery():
    bat = psutil.sensors_battery()
    if bat is None:
        return None
    plugged = bat.power_plugged
    if plugged:
        status = "Charging" if bat.percent < 100 else "Full"
        tl_sec = None
        tl_human = None
    else:
        status = "Discharging"
        tl_sec = bat.secsleft if bat.secsleft != psutil.POWER_TIME_UNLIMITED else None
        tl_human = _uptime(tl_sec) if tl_sec else "Calculating..."
    return BatteryInfo(
        percent=round(bat.percent, 1),
        power_plugged=plugged,
        time_left_seconds=tl_sec,
        time_left_human=tl_human,
        status=status,
    )


@app.get("/api/processes", response_model=List[ProcessInfo])
async def get_processes(limit: int = 25, sort_by: str = "cpu"):
    procs = []
    for p in psutil.process_iter(
        ["pid", "name", "cpu_percent", "memory_percent", "memory_info", "status", "username"]
    ):
        try:
            info = p.info
            rss = info.get("memory_info", None)
            procs.append(ProcessInfo(
                pid=info["pid"],
                name=info.get("name") or "unknown",
                cpu_percent=round(info.get("cpu_percent") or 0, 1),
                memory_percent=round(info.get("memory_percent") or 0, 2),
                memory_rss_human=_human(rss.rss) if rss else "N/A",
                status=info.get("status") or "unknown",
                username=info.get("username") or "unknown",
            ))
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    key = "cpu_percent" if sort_by == "cpu" else "memory_percent"
    return sorted(procs, key=lambda p: getattr(p, key), reverse=True)[:limit]


@app.get("/api/hardware")
async def get_hardware():
    return {
        "cpu_model": _cpu_model(),
        "cpu_cores": f"{psutil.cpu_count(logical=False)} physical / {psutil.cpu_count(logical=True)} logical",
        "total_ram": _human(psutil.virtual_memory().total),
        "disks": [
            {"device": p.device, "total": _human(psutil.disk_usage(p.mountpoint).total)}
            for p in psutil.disk_partitions(all=False)
            if "loop" not in p.device
        ],
        "platform": {
            "system": platform.system(),
            "node": platform.node(),
            "release": platform.release(),
            "machine": platform.machine(),
            "processor": platform.processor(),
        },
        "lshw_short": _run("lshw -short 2>/dev/null | head -25") or "lshw not available",
        "usb_devices": _run("lsusb 2>/dev/null") or "Not available",
        "pci_devices": _run("lspci 2>/dev/null | head -15") or "Not available",
        "sensors_raw": _run("sensors 2>/dev/null") or "Run: sudo sensors-detect",
    }


@app.get("/api/full-report")
async def full_report():
    """Export complete system report as JSON."""
    sys_info = await get_system()
    cpu_info = await get_cpu()
    mem_info = await get_memory()
    disks = await get_disks()
    nets = await get_network()
    temps = await get_temperatures()
    bat = await get_battery()
    procs = await get_processes(10)

    return JSONResponse({
        "generated_at": datetime.now().isoformat(),
        "horus_os": "1.0.0",
        "system": sys_info.dict(),
        "cpu": cpu_info.dict(),
        "memory": mem_info.dict(),
        "disks": [d.dict() for d in disks],
        "network": [n.dict() for n in nets],
        "temperatures": [t.dict() for t in temps],
        "battery": bat.dict() if bat else None,
        "top_processes": [p.dict() for p in procs],
    })


@app.post("/api/performance-mode/{mode}", response_model=PerformanceModeResult)
async def set_performance_mode(mode: str):
    modes = {
        "performance": "performance",
        "balanced":    "ondemand",
        "powersave":   "powersave",
    }
    if mode not in modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Choose: {list(modes)}")
    governor = modes[mode]
    result = _run(
        f"echo {governor} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor 2>/dev/null"
    )
    applied = bool(result)
    return PerformanceModeResult(
        mode=mode,
        governor=governor,
        applied=applied,
        message=f"Governor set to {governor}" if applied else "Failed (requires sudo or not supported)",
    )


@app.get("/api/security-quick")
async def security_quick():
    return {
        "ufw_status": _run("sudo ufw status 2>/dev/null | head -3") or "Not available",
        "ssh_running": bool(_run("systemctl is-active ssh 2>/dev/null") == "active"),
        "updates_available": int(_run("apt list --upgradable 2>/dev/null | grep -c upgradable") or "0"),
        "disk_encrypted": bool(_run("lsblk -o name,type | grep crypt") != ""),
        "firewall_active": "active" in (_run("sudo ufw status 2>/dev/null") or ""),
    }


# ── Entry Point ────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8420,
        reload=False,
        log_level="info",
        access_log=False,
    )
