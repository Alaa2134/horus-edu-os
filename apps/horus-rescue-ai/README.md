# Horus Rescue AI

**AI-Powered Emergency Prioritization System** — _Report. Detect. Prioritize. Rescue._

Horus Rescue AI fuses **AI camera detection** with low-cost **ESP32 + IR
checkpoints** to detect, verify, and prioritize people during disasters. Two
independent signals (visual + physical) are combined into a single transparent
risk score, drastically cutting false alarms and saving critical minutes.

> Runs **fully offline** with an in-memory mock backend — no hardware, no
> database, no API keys required. A Supabase-ready architecture is included for
> real persistence.

## Quick start

```bash
cd apps/horus-rescue-ai
npm install
npm run dev      # http://localhost:5180
```

Build for production:

```bash
npm run build && npm run preview
```

## The demo scenario (90 seconds)

1. Open the **Command Dashboard** (`/app`).
2. Go to **AI Camera Detection** → _Simulate Person Detection_ on **AI Faculty Gate**.
3. Go to **Smart Checkpoints** → _Simulate IR_ on **ESP-CHECKPOINT-01** (same location).
4. The fusion engine cross-confirms both signals → risk becomes **Critical (≈95)**.
5. Dashboard raises an animated **critical alert**, the checkpoint buzzer/LED fire,
   and a rescue team is auto-dispatched.
6. Assign / advance the team on the **Rescue Board**, then explore **Analytics**.
7. File a report from the **Mobile Emergency Report** screen (`/mobile`).

Or just open **Simulation** (`/app/simulation`) and hit
_Run Disaster Simulation_ / _Simulate AI + IR Critical Alert_.

## Pages

| Route | Page |
| --- | --- |
| `/` | Landing / pitch |
| `/app` | Command Dashboard |
| `/app/checkpoints` | Smart Checkpoints (ESP32 + IR) |
| `/app/cameras` | AI Camera Detection |
| `/app/reports` | Emergency Reports (filterable) |
| `/app/reports/:id` | Report Details (evidence, AI explanation, actions) |
| `/app/rescue` | Rescue Team Board (drag-and-drop Kanban) |
| `/app/analytics` | Analytics & insights |
| `/app/simulation` | Disaster Simulation |
| `/app/settings` | Settings |
| `/app/about` | About / Hackathon Pitch |
| `/mobile` | Mobile Emergency Report (bottom-nav PWA) |

## Architecture

```
src/
  types/         Domain interfaces (reports, devices, teams, timeline…)
  lib/
    riskEngine.ts   calculateRiskScore() — additive, explainable, fusion bonus
    mockApi.ts      In-memory store + REST-style service (postIrAlert, …)
    supabaseClient.ts  Optional Supabase client (lazy, falls back to mock)
  store/         useSyncExternalStore bindings (useAppState / useActions)
  data/seed.ts   Seed devices, teams, reports, timeline
  components/    Glass UI primitives, layout, timeline, alert banner, toasts
  pages/         The 12 pages above
supabase/schema.sql   Postgres schema + RLS policies mirroring the types
```

### Risk engine

`calculateRiskScore(input)` returns `{ score, priority, explanation,
recommendation, factors, fusion }`.

| Signal | Points |
| --- | --- |
| Camera detected a person | +30 |
| IR checkpoint triggered | +25 |
| Multiple people (>1) | +15 |
| Crowd (>3) | +25 |
| Inside danger zone | +30 |
| Repeated crossings | +10 |
| High-risk location | +10 |
| Critical type (Fire/Collapse/Gas/Stampede) | +30 |
| **AI + IR fusion confirmation** | **+10** |

Levels: `0–30 Low · 31–60 Medium · 61–80 High · 81–100 Critical`.

### Mock API (swap-in points for a real backend)

`src/lib/mockApi.ts` exposes the planned endpoints as functions:

- `postIrAlert({ deviceId, location, eventType, message })`
- `postCameraDetection({ cameraId, personDetected, peopleCount, confidence })`
- `postManualReport({ type, location, description, affectedPeople, trapped, medicalNeeded })`
- `getReports()` · `getCheckpoints()` · `getCameras()`

To go live, point these at Supabase (schema in `supabase/schema.sql`) — the UI
layer never changes.

## Hardware (Smart Checkpoint)

ESP32 + IR sensor, with buzzer + LED. Wiring and Arduino firmware are bundled in
the app: **Smart Checkpoints → ESP32 Wiring & Code**.

```
IR OUT  → GPIO 27      LED + (220Ω) → GPIO 2       Buzzer + → GPIO 26
VCC     → 3.3V         LED −        → GND          Buzzer − → GND
GND     → GND
```

On a crossing the device fires its alarm and `POST`s to `/api/ir-alert`. When a
linked camera already sees a person, the fusion engine escalates to Critical.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Recharts ·
Lucide icons · Supabase-ready (optional).

## Roadmap

Dahua/Hikvision RTSP · YOLO person detection · WhatsApp/SMS alerts ·
GPS rescue routing · IoT smoke/fire sensors · drone integration ·
Supabase real-time database.
