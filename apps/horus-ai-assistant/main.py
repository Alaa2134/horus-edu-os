"""
HORUS OS AI Assistant — Backend API
Conversational AI with OS and hardware awareness.
Modes: student, engineer, debug, demo
Backends: Ollama (local/offline) → OpenAI API (cloud fallback)
Port: 8421
"""
from __future__ import annotations

import json
import os
import platform
import subprocess
import time
from pathlib import Path
from typing import AsyncIterator, Literal, Optional

import psutil
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="HORUS AI Assistant", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Knowledge base ─────────────────────────────────────────────────────
KB_PATH = Path(__file__).parent / "knowledge_base.json"
try:
    KNOWLEDGE_BASE: dict = json.loads(KB_PATH.read_text(encoding="utf-8"))
except Exception:
    KNOWLEDGE_BASE = {}

# ── Configuration ──────────────────────────────────────────────────────
OLLAMA_URL    = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL  = os.getenv("OLLAMA_MODEL", "mistral")
OPENAI_KEY    = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL  = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# ── Models ─────────────────────────────────────────────────────────────
Mode = Literal["student", "engineer", "debug", "demo"]

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    mode: Mode = "engineer"
    stream: bool = False

class ChatResponse(BaseModel):
    reply: str
    mode: Mode
    backend: str
    tokens: Optional[int] = None

# ── System Context ─────────────────────────────────────────────────────

def _read_os_release() -> dict[str, str]:
    result: dict[str, str] = {}
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


def get_system_context() -> str:
    os_r = _read_os_release()
    mem = psutil.virtual_memory()
    cpu_model = "Unknown"
    try:
        with open("/proc/cpuinfo") as f:
            for line in f:
                if "model name" in line:
                    cpu_model = line.split(":", 1)[1].strip()
                    break
    except Exception:
        cpu_model = platform.processor()

    return f"""
HORUS OS System Context:
- OS: {os_r.get('PRETTY_NAME', 'HORUS OS 1.0.0')}
- Kernel: {platform.release()}
- Hostname: {platform.node()}
- CPU: {cpu_model}
- Logical Cores: {psutil.cpu_count()}
- RAM Total: {mem.total // 1024 // 1024} MB
- RAM Used: {mem.used // 1024 // 1024} MB ({mem.percent:.0f}%)
- Architecture: {platform.machine()}
- Creator: {os_r.get('HORUS_CREATOR', 'Alaa Saber')}
""".strip()


def _mode_prompt(mode: Mode) -> str:
    prompts = {
        "student": (
            "You are the HORUS AI Assistant in Student Mode. "
            "Explain concepts simply and patiently. Use analogies. "
            "Encourage learning and ask guiding questions. "
            "Keep responses concise and friendly. "
            "If asked about Linux/Python/Arduino commands, give simple examples."
        ),
        "engineer": (
            "You are the HORUS AI Assistant in Engineer Mode. "
            "Provide precise, technical, expert-level answers. "
            "Include relevant commands, code snippets, and system details. "
            "Be efficient and accurate. No unnecessary fluff."
        ),
        "debug": (
            "You are the HORUS AI Assistant in Debug Mode. "
            "Focus on diagnosing problems. Ask clarifying questions. "
            "Suggest specific diagnostic commands. Show log analysis. "
            "Provide step-by-step troubleshooting procedures. "
            "Always consider HORUS OS specifics."
        ),
        "demo": (
            "You are the HORUS AI Assistant in Competition Demo Mode. "
            "Respond impressively and confidently. "
            "Highlight HORUS OS features and capabilities. "
            "Keep answers engaging and suitable for a live audience. "
            "Make the technology sound exciting and innovative. "
            "Reference Alaa Saber as the creator when appropriate."
        ),
    }
    return prompts.get(mode, prompts["engineer"])


def build_system_prompt(mode: Mode) -> str:
    kb_summary = ""
    if KNOWLEDGE_BASE:
        kb_summary = "\n\nKnowledge base:\n" + json.dumps(
            {k: v for k, v in KNOWLEDGE_BASE.items() if k != "_meta"}, indent=2
        )[:2000]

    return f"""{_mode_prompt(mode)}

You have full knowledge of HORUS OS and its features. You know:
- HORUS OS is a custom Linux-based OS built on Ubuntu 22.04 LTS
- It was created by Alaa Saber for a university competition
- It includes HORUS Control Center, AI Assistant, Demo Mode, Security Center
- It targets embedded laptops, AI education, hardware control
- It features XFCE4 desktop with a dark cyber-Egyptian theme
- Its slogan is "Intelligence Awakened" — "ذكاء مدمج للمستقبل"

Current system state:
{get_system_context()}
{kb_summary}

Respond in the same language the user writes in (Arabic or English).
Keep responses focused and well-formatted. Use markdown for code and lists.
"""

# ── AI Backends ────────────────────────────────────────────────────────

async def _ollama_chat(messages: list[dict], model: str = OLLAMA_MODEL) -> tuple[str, int]:
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(f"{OLLAMA_URL}/api/chat", json={
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": 0.7, "num_predict": 1024},
        })
        r.raise_for_status()
        data = r.json()
        reply = data.get("message", {}).get("content", "")
        tokens = data.get("eval_count", 0)
        return reply, tokens


async def _openai_chat(messages: list[dict]) -> tuple[str, int]:
    if not OPENAI_KEY:
        raise ValueError("No OpenAI API key configured")
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_KEY}"},
            json={
                "model": OPENAI_MODEL,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024,
            },
        )
        r.raise_for_status()
        data = r.json()
        reply = data["choices"][0]["message"]["content"]
        tokens = data["usage"]["total_tokens"]
        return reply, tokens


async def chat_ai(messages: list[dict], mode: Mode) -> tuple[str, str, int]:
    """Try Ollama first, fall back to OpenAI, then return a helpful offline message."""
    sys_msg = {"role": "system", "content": build_system_prompt(mode)}
    full_messages = [sys_msg] + messages

    # Try Ollama (local)
    try:
        reply, tokens = await _ollama_chat(full_messages)
        return reply, "ollama", tokens
    except Exception as e:
        pass  # Ollama not running

    # Try OpenAI (cloud)
    try:
        reply, tokens = await _openai_chat(full_messages)
        return reply, "openai", tokens
    except Exception:
        pass

    # Offline fallback: rule-based answers from knowledge base
    last_msg = messages[-1]["content"].lower() if messages else ""
    reply = _offline_response(last_msg, mode)
    return reply, "offline", 0


def _offline_response(query: str, mode: Mode) -> str:
    kb = KNOWLEDGE_BASE

    # Check for keyword matches
    if any(w in query for w in ["what is horus", "what is this os", "tell me about"]):
        return kb.get("about_horus", "HORUS OS is a custom Linux-based operating system for embedded intelligence, created by Alaa Saber.")
    if any(w in query for w in ["cpu", "processor", "cores"]):
        ctx = get_system_context()
        return f"CPU Information from this system:\n```\n{ctx}\n```"
    if any(w in query for w in ["python", "script", "code"]):
        return "Python 3.11 is pre-installed. Run: `python3 your_script.py`\nInstall packages: `pip3 install package-name`"
    if any(w in query for w in ["arduino", "microcontroller"]):
        return "Arduino CLI is pre-installed. Run: `arduino-cli board list` to detect boards.\nFor help: `arduino-cli help`"
    if any(w in query for w in ["wifi", "network", "internet"]):
        return "Use NetworkManager: `nmcli device wifi list` to scan\n`nmcli device wifi connect 'SSID' password 'pass'` to connect"
    if any(w in query for w in ["help", "commands", "what can you do"]):
        return """I am HORUS AI, your intelligent system assistant.

I can help with:
- Linux commands and system administration
- Python and Arduino programming
- Embedded systems and GPIO
- Hardware diagnostics
- HORUS OS features and configuration
- Troubleshooting

*Note: I'm in offline mode. Connect Ollama or add an OpenAI API key for full AI capabilities.*
"""
    if any(w in query for w in ["creator", "who made", "alaa"]):
        return "HORUS OS was created by **Alaa Saber** as a university competition project. It is a custom Linux-based operating system for embedded intelligence."

    if mode == "demo":
        return (
            "HORUS OS demonstrates the future of student-built computing. "
            "This operating system combines Ancient Egyptian heritage with cutting-edge embedded intelligence. "
            "Every feature — from the boot screen to this AI — was designed by Alaa Saber.\n\n"
            "*Tip: Configure Ollama with `mistral` model for full AI capabilities.*"
        )

    return (
        "I'm currently in offline mode (no local AI model running).\n\n"
        "To enable full AI:\n"
        "1. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`\n"
        "2. Pull Mistral: `ollama pull mistral`\n"
        "3. Start it: `ollama serve`\n\n"
        "Or set `OPENAI_API_KEY` environment variable for cloud inference."
    )


# ── API Endpoints ──────────────────────────────────────────────────────

@app.get("/")
async def root():
    frontend = Path(__file__).parent / "frontend" / "dist" / "index.html"
    if frontend.exists():
        return HTMLResponse(frontend.read_text(encoding="utf-8"))
    return HTMLResponse("""
    <!DOCTYPE html><html><head>
    <title>HORUS AI Assistant</title>
    <style>
      body{background:#0a0a0f;color:#e8e8f0;font-family:monospace;
           display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
      .card{text-align:center;padding:40px;border:1px solid #c9a22740;border-radius:12px;background:#12121a;}
      h1{color:#c9a227;} p{color:#aaaacc;} a{color:#00d4ff;}
    </style></head><body>
    <div class="card">
      <h1>HORUS AI Assistant</h1>
      <p>API running on port 8421</p>
      <p><a href="/api/docs">API Docs →</a></p>
    </div></body></html>
    """)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    messages = [m.dict() for m in req.messages]
    reply, backend, tokens = await chat_ai(messages, req.mode)
    return ChatResponse(reply=reply, mode=req.mode, backend=backend, tokens=tokens)


@app.get("/api/status")
async def status():
    ollama_ok = False
    openai_ok = bool(OPENAI_KEY)

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            models = [m["name"] for m in r.json().get("models", [])]
            ollama_ok = True
    except Exception:
        models = []

    return {
        "status": "online",
        "ollama": {"available": ollama_ok, "url": OLLAMA_URL, "models": models},
        "openai": {"available": openai_ok, "model": OPENAI_MODEL if openai_ok else None},
        "offline_fallback": True,
        "system": get_system_context(),
    }


@app.get("/api/modes")
async def get_modes():
    return {
        "modes": [
            {"id": "student",  "name": "Student Mode",   "description": "Simple explanations, learning-friendly, encouraging"},
            {"id": "engineer", "name": "Engineer Mode",   "description": "Technical depth, precise commands, expert level"},
            {"id": "debug",    "name": "Debug Mode",      "description": "Diagnostics focused, log analysis, troubleshooting"},
            {"id": "demo",     "name": "Competition Demo", "description": "Impressive, engaging, audience-ready responses"},
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8421, reload=False, log_level="info")
