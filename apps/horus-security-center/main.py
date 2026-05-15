"""
HORUS Security Center — FastAPI backend
Port: 8422
"""

import subprocess
import json
import re
import os
import glob
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel

app = FastAPI(title="HORUS Security Center", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")


# ── Models ──────────────────────────────────────────────────────────────────

class FirewallRule(BaseModel):
    number: int
    to: str
    action: str
    from_: str
    protocol: Optional[str] = None


class FirewallStatus(BaseModel):
    enabled: bool
    status: str
    rules: list[FirewallRule]
    default_incoming: str
    default_outgoing: str


class NetworkConnection(BaseModel):
    proto: str
    local_address: str
    foreign_address: str
    state: str
    pid: Optional[int] = None
    program: Optional[str] = None


class SSHConfig(BaseModel):
    port: int
    permit_root_login: str
    password_authentication: str
    pubkey_authentication: str
    max_auth_tries: int
    hardened: bool


class DiskEncryption(BaseModel):
    device: str
    name: str
    type: str
    encrypted: bool


class LogEntry(BaseModel):
    timestamp: str
    level: str
    unit: str
    message: str


class SecurityScore(BaseModel):
    score: int
    max_score: int
    grade: str
    checks: list[dict]


class FirewallRuleRequest(BaseModel):
    rule: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def _run(cmd: list[str], timeout: int = 10) -> tuple[str, int]:
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout.strip(), result.returncode
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return "", 1


def _run_shell(cmd: str, timeout: int = 10) -> str:
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout.strip()
    except Exception:
        return ""


# ── Firewall ─────────────────────────────────────────────────────────────────

@app.get("/api/firewall", response_model=FirewallStatus)
async def get_firewall():
    out, code = _run(["ufw", "status", "numbered"])
    if code != 0:
        return FirewallStatus(
            enabled=False, status="inactive", rules=[],
            default_incoming="deny", default_outgoing="allow"
        )

    enabled = "Status: active" in out
    rules = []
    default_in = "deny"
    default_out = "allow"

    for line in out.splitlines():
        m = re.match(r"Default: (\w+) \(incoming\), (\w+) \(outgoing\)", line)
        if m:
            default_in = m.group(1)
            default_out = m.group(2)

        m = re.match(r"\[\s*(\d+)\]\s+(\S+)\s+(ALLOW|DENY|REJECT|LIMIT)\s+(.*)", line)
        if m:
            rules.append(FirewallRule(
                number=int(m.group(1)),
                to=m.group(2),
                action=m.group(3),
                from_=m.group(4).strip(),
            ))

    return FirewallStatus(
        enabled=enabled,
        status="active" if enabled else "inactive",
        rules=rules,
        default_incoming=default_in,
        default_outgoing=default_out,
    )


@app.post("/api/firewall/enable")
async def enable_firewall():
    _run(["ufw", "--force", "enable"])
    return {"ok": True, "status": "Firewall enabled"}


@app.post("/api/firewall/disable")
async def disable_firewall():
    _run(["ufw", "disable"])
    return {"ok": True, "status": "Firewall disabled"}


@app.post("/api/firewall/rule")
async def add_firewall_rule(req: FirewallRuleRequest):
    parts = req.rule.split()
    out, code = _run(["ufw"] + parts)
    if code != 0:
        raise HTTPException(status_code=400, detail=out or "Invalid rule")
    return {"ok": True, "output": out}


@app.delete("/api/firewall/rule/{number}")
async def delete_firewall_rule(number: int):
    out, code = _run(["ufw", "--force", "delete", str(number)])
    if code != 0:
        raise HTTPException(status_code=400, detail=out or "Could not delete rule")
    return {"ok": True}


# ── Network connections ───────────────────────────────────────────────────────

@app.get("/api/connections", response_model=list[NetworkConnection])
async def get_connections():
    out = _run_shell("ss -tunp 2>/dev/null | tail -n +2")
    connections = []
    for line in out.splitlines():
        parts = line.split()
        if len(parts) < 5:
            continue
        proto = parts[0]
        local = parts[4] if len(parts) > 4 else ""
        foreign = parts[5] if len(parts) > 5 else ""
        state = parts[1] if proto in ("tcp", "tcp6") else "STATELESS"
        pid = None
        prog = None
        pid_match = re.search(r'pid=(\d+),fd', line)
        prog_match = re.search(r'\"(.+?)\"', line)
        if pid_match:
            pid = int(pid_match.group(1))
        if prog_match:
            prog = prog_match.group(1)
        connections.append(NetworkConnection(
            proto=proto,
            local_address=local,
            foreign_address=foreign,
            state=state,
            pid=pid,
            program=prog,
        ))
    return connections[:50]


# ── SSH ───────────────────────────────────────────────────────────────────────

@app.get("/api/ssh", response_model=SSHConfig)
async def get_ssh_config():
    def read_sshd(key: str, default: str) -> str:
        for conf in ["/etc/ssh/sshd_config", "/etc/ssh/sshd_config.d/horus.conf"]:
            try:
                with open(conf) as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith(key):
                            return line.split(None, 1)[1]
            except FileNotFoundError:
                pass
        return default

    port_str = read_sshd("Port", "22")
    try:
        port = int(port_str)
    except ValueError:
        port = 22

    permit_root = read_sshd("PermitRootLogin", "yes")
    password_auth = read_sshd("PasswordAuthentication", "yes")
    pubkey = read_sshd("PubkeyAuthentication", "yes")
    max_tries_str = read_sshd("MaxAuthTries", "6")
    try:
        max_tries = int(max_tries_str)
    except ValueError:
        max_tries = 6

    hardened = (
        permit_root in ("no", "prohibit-password")
        and password_auth == "no"
        and max_tries <= 3
    )

    return SSHConfig(
        port=port,
        permit_root_login=permit_root,
        password_authentication=password_auth,
        pubkey_authentication=pubkey,
        max_auth_tries=max_tries,
        hardened=hardened,
    )


# ── Disk Encryption (LUKS) ────────────────────────────────────────────────────

@app.get("/api/encryption", response_model=list[DiskEncryption])
async def get_encryption():
    out = _run_shell("lsblk -Jpo NAME,TYPE,FSTYPE,MOUNTPOINT 2>/dev/null")
    disks = []
    try:
        data = json.loads(out)
        def walk(devices):
            for dev in devices:
                encrypted = dev.get("fstype", "") == "crypto_LUKS" or dev.get("type", "") == "crypt"
                disks.append(DiskEncryption(
                    device=dev.get("name", ""),
                    name=dev.get("name", "").split("/")[-1],
                    type=dev.get("type", ""),
                    encrypted=encrypted,
                ))
                if dev.get("children"):
                    walk(dev["children"])
        walk(data.get("blockdevices", []))
    except (json.JSONDecodeError, KeyError):
        pass
    return disks


# ── System Logs ───────────────────────────────────────────────────────────────

@app.get("/api/logs", response_model=list[LogEntry])
async def get_logs(unit: Optional[str] = None, lines: int = 100):
    cmd = ["journalctl", "--no-pager", "-n", str(min(lines, 500)), "-o", "short-iso"]
    if unit:
        cmd += ["-u", unit]
    out, _ = _run(cmd, timeout=15)
    entries = []
    for line in out.splitlines():
        m = re.match(
            r"(\S+)\s+(\S+)\s+(\S+)\[?\d*\]?:\s+(.*)", line
        )
        if m:
            msg = m.group(4)
            level = "error" if any(w in msg.lower() for w in ["error", "fail", "crit"]) else \
                    "warning" if any(w in msg.lower() for w in ["warn", "notice"]) else "info"
            entries.append(LogEntry(
                timestamp=m.group(1),
                level=level,
                unit=m.group(3),
                message=msg,
            ))
    return entries


# ── Auth Log (failed logins) ──────────────────────────────────────────────────

@app.get("/api/auth-events")
async def get_auth_events():
    out, _ = _run(
        ["journalctl", "--no-pager", "-n", "50", "-u", "ssh", "-o", "short-iso"],
        timeout=10,
    )
    failed = []
    for line in out.splitlines():
        if "Failed password" in line or "Invalid user" in line:
            failed.append(line)
    return {"failed_attempts": len(failed), "recent": failed[:10]}


# ── Security Score ────────────────────────────────────────────────────────────

@app.get("/api/score", response_model=SecurityScore)
async def get_security_score():
    checks = []

    # UFW enabled
    ufw_out, ufw_code = _run(["ufw", "status"])
    ufw_on = "active" in ufw_out
    checks.append({"id": "firewall", "label": "Firewall (UFW) enabled", "pass": ufw_on, "weight": 20})

    # SSH permit root
    ssh = await get_ssh_config()
    root_ok = ssh.permit_root_login in ("no", "prohibit-password")
    checks.append({"id": "ssh_root", "label": "SSH root login disabled", "pass": root_ok, "weight": 20})

    # SSH password auth
    pw_ok = ssh.password_authentication == "no"
    checks.append({"id": "ssh_pw", "label": "SSH password auth disabled", "pass": pw_ok, "weight": 15})

    # SSH port changed
    port_ok = ssh.port != 22
    checks.append({"id": "ssh_port", "label": "SSH non-default port", "pass": port_ok, "weight": 10})

    # Automatic updates
    unattended = os.path.exists("/etc/apt/apt.conf.d/20auto-upgrades")
    checks.append({"id": "updates", "label": "Automatic updates configured", "pass": unattended, "weight": 15})

    # No world-writable files in /etc
    ww_out = _run_shell("find /etc -maxdepth 2 -perm -o+w -type f 2>/dev/null | wc -l")
    no_ww = ww_out.strip() == "0"
    checks.append({"id": "etc_perms", "label": "No world-writable /etc files", "pass": no_ww, "weight": 10})

    # Disk encryption
    enc = await get_encryption()
    has_luks = any(d.encrypted for d in enc)
    checks.append({"id": "encryption", "label": "LUKS disk encryption", "pass": has_luks, "weight": 10})

    score = sum(c["weight"] for c in checks if c["pass"])
    max_score = sum(c["weight"] for c in checks)

    if score >= 85:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 55:
        grade = "C"
    elif score >= 40:
        grade = "D"
    else:
        grade = "F"

    return SecurityScore(score=score, max_score=max_score, grade=grade, checks=checks)


# ── Listening Ports ───────────────────────────────────────────────────────────

@app.get("/api/ports")
async def get_listening_ports():
    out = _run_shell("ss -tlnp 2>/dev/null")
    ports = []
    for line in out.splitlines()[1:]:
        parts = line.split()
        if len(parts) < 4:
            continue
        local = parts[3]
        prog = ""
        m = re.search(r'"(.+?)"', line)
        if m:
            prog = m.group(1)
        ports.append({"address": local, "program": prog, "state": parts[0]})
    return {"ports": ports}


# ── Frontend ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index):
        return FileResponse(index)
    return HTMLResponse("""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HORUS Security Center</title>
  <style>
    body { background:#0a0a0f; color:#e8e8f0; font-family:monospace; display:flex;
           align-items:center; justify-content:center; height:100vh; margin:0; }
    .box { text-align:center; }
    h1 { color:#c9a227; font-size:2rem; }
    p { color:#00d4ff; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🛡 HORUS Security Center</h1>
    <p>API running on port 8422</p>
    <p>Frontend: cd apps/horus-security-center/frontend && npm install && npm run build</p>
  </div>
</body>
</html>""")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8422, reload=False)
