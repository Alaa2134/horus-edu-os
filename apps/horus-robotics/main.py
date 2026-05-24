"""
HORUS Robotics — backend API for makers, robotics and embedded students.

The heart of the "AI & Robotics distribution": auto-detects Arduino/ESP32
boards, lists serial ports, scaffolds ready-made projects from templates,
and provides a beginner-friendly wiring helper for common components.

Port: 8423 · binds to 127.0.0.1 only.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

app = FastAPI(title="HORUS Robotics", version="1.0.0", docs_url="/api/docs")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

APP_DIR = Path(__file__).parent
TEMPLATES_DIR = Path(os.getenv("HORUS_TEMPLATES", "/opt/horus/templates"))
PROJECTS_DIR = Path(os.path.expanduser("~/HorusProjects"))
WIRING_PATH = APP_DIR / "wiring.json"

try:
    WIRING = json.loads(WIRING_PATH.read_text(encoding="utf-8"))
except Exception:
    WIRING = {}


def _run(cmd: list[str], timeout: int = 8) -> str:
    try:
        return subprocess.check_output(cmd, text=True, timeout=timeout,
                                       stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


# ── Board / serial detection ─────────────────────────────────────────────

def detect_boards() -> list[dict]:
    """Detect connected boards. Prefer arduino-cli; fall back to serial scan."""
    boards: list[dict] = []

    if shutil.which("arduino-cli"):
        raw = _run(["arduino-cli", "board", "list", "--format", "json"])
        if raw:
            try:
                data = json.loads(raw)
                # arduino-cli >=0.18 returns {"detected_ports":[...]} ; older returns list
                ports = data.get("detected_ports", data) if isinstance(data, dict) else data
                for entry in ports or []:
                    port = entry.get("port", entry) if isinstance(entry, dict) else {}
                    matching = entry.get("matching_boards") or entry.get("boards") or []
                    name = matching[0].get("name") if matching else None
                    fqbn = matching[0].get("fqbn") if matching else None
                    boards.append({
                        "port": port.get("address", "unknown"),
                        "protocol": port.get("protocol", "serial"),
                        "name": name or "Unknown board",
                        "fqbn": fqbn,
                        "source": "arduino-cli",
                    })
            except json.JSONDecodeError:
                pass

    if not boards:
        # Fallback: raw serial scan via pyserial
        try:
            from serial.tools import list_ports
            for p in list_ports.comports():
                guess = "ESP32/ESP8266" if "CP210" in (p.description or "") or "CH340" in (p.description or "") \
                    else "Arduino" if "Arduino" in (p.description or "") or "ACM" in p.device else "Serial device"
                boards.append({
                    "port": p.device,
                    "protocol": "serial",
                    "name": f"{guess} — {p.description or 'serial'}",
                    "fqbn": None,
                    "source": "pyserial",
                })
        except Exception:
            for pattern in ("/dev/ttyUSB*", "/dev/ttyACM*"):
                import glob
                for dev in glob.glob(pattern):
                    boards.append({"port": dev, "protocol": "serial",
                                   "name": "Serial device", "fqbn": None, "source": "glob"})
    return boards


# ── Templates / project scaffolding ──────────────────────────────────────

def list_templates() -> list[dict]:
    out: list[dict] = []
    if TEMPLATES_DIR.is_dir():
        for d in sorted(TEMPLATES_DIR.iterdir()):
            if not d.is_dir():
                continue
            meta = {"id": d.name, "name": d.name.replace("-", " ").title(),
                    "description": "", "tags": []}
            mf = d / "horus.json"
            if mf.exists():
                try:
                    meta.update(json.loads(mf.read_text(encoding="utf-8")))
                except Exception:
                    pass
            out.append(meta)
    return out


class NewProject(BaseModel):
    template: str
    name: str


@app.post("/api/new-project")
async def new_project(req: NewProject):
    src = TEMPLATES_DIR / req.template
    if not src.is_dir():
        raise HTTPException(404, f"Template '{req.template}' not found")
    safe = "".join(c for c in req.name if c.isalnum() or c in ("-", "_", " ")).strip().replace(" ", "-")
    if not safe:
        raise HTTPException(400, "Invalid project name")
    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    dest = PROJECTS_DIR / safe
    if dest.exists():
        raise HTTPException(409, f"Project '{safe}' already exists")
    shutil.copytree(src, dest, ignore=shutil.ignore_patterns("horus.json"))
    return {"created": str(dest), "template": req.template, "name": safe}


# ── API ──────────────────────────────────────────────────────────────────

@app.get("/api/boards")
async def boards():
    return {"boards": detect_boards(), "arduino_cli": bool(shutil.which("arduino-cli"))}

@app.get("/api/templates")
async def templates():
    return {"templates": list_templates(), "projects_dir": str(PROJECTS_DIR)}

@app.get("/api/wiring")
async def wiring():
    return WIRING

@app.get("/api/wiring/{component}")
async def wiring_one(component: str):
    item = (WIRING.get("components") or {}).get(component)
    if not item:
        raise HTTPException(404, f"No wiring data for '{component}'")
    return item

@app.get("/api/toolchain")
async def toolchain():
    """Report which maker toolchains are installed — powers 'Fix my environment'."""
    checks = {
        "arduino-cli": "arduino-cli", "python3": "python3", "pip3": "pip3",
        "node": "node", "git": "git", "platformio": "pio", "docker": "docker",
        "flutter": "flutter", "code": "code", "i2cdetect": "i2cdetect",
    }
    return {k: bool(shutil.which(v)) for k, v in checks.items()}


@app.get("/")
async def root():
    return HTMLResponse((APP_DIR / "index.html").read_text(encoding="utf-8"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8423, reload=False, log_level="info")
