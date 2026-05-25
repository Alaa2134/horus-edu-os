import { useState } from "react";
import {
  Camera,
  Scan,
  UserCheck,
  Users,
  XCircle,
  Power,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { useActions, useAppState } from "@/store/useStore";
import { cn } from "@/lib/utils";
import type { CameraDevice } from "@/types";

/** Pseudo-random but stable detection boxes for a given camera + count. */
function boxesFor(cam: CameraDevice) {
  const seedNum = cam.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: cam.peopleCount }).map((_, i) => {
    const r = (n: number) => ((Math.sin(seedNum + i * 99 + n) + 1) / 2);
    const w = 12 + r(1) * 10;
    const h = 26 + r(2) * 14;
    const left = 8 + r(3) * (78 - w);
    const top = 30 + r(4) * (55 - h);
    return { left, top, w, h, conf: Math.round((0.7 + r(5) * 0.29) * 100) };
  });
}

function CameraView({ cam }: { cam: CameraDevice }) {
  const detecting = cam.personDetected && cam.status === "Online";
  const boxes = detecting ? boxesFor(cam) : [];

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
      {/* feed backdrop */}
      <div className="scan-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-900/40 via-transparent to-bg-900/60" />

      {cam.status === "Offline" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
          <Power className="h-8 w-8" />
          <span className="font-mono text-xs uppercase tracking-widest">No Signal</span>
        </div>
      ) : (
        <>
          {/* scanning line */}
          <div className="absolute inset-x-0 top-0 h-12 animate-scanline bg-gradient-to-b from-ai/40 to-transparent" />

          {/* danger zone */}
          {cam.dangerZoneActive && (
            <div className="absolute bottom-3 left-3 right-3 top-1/2 rounded-lg border-2 border-dashed border-critical/50 bg-critical/5">
              <span className="absolute left-2 top-2 rounded bg-critical/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-critical">
                Danger Zone
              </span>
            </div>
          )}

          {/* detection boxes */}
          {boxes.map((b, i) => (
            <div
              key={i}
              className="absolute animate-fade-up rounded border-2 border-danger shadow-[0_0_12px_rgba(255,59,59,0.6)]"
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: `${b.w}%`,
                height: `${b.h}%`,
              }}
            >
              <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                person {b.conf}%
              </span>
            </div>
          ))}

          {/* HUD */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-ai backdrop-blur">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger" /> REC
            </span>
            <span className="rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-slate-300 backdrop-blur">
              {cam.id}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-slate-300 backdrop-blur">
            {detecting ? `${cam.peopleCount} detected · ${Math.round(cam.confidence * 100)}%` : "scanning…"}
          </div>
        </>
      )}
    </div>
  );
}

function CameraPanel({ cam }: { cam: CameraDevice }) {
  const actions = useActions();
  const online = cam.status === "Online";

  return (
    <GlassCard className={cn(cam.personDetected && "border-danger/40 shadow-glow-danger")}>
      <CardHeader
        title={cam.location}
        subtitle={cam.id}
        icon={<Camera className="h-4 w-4" />}
        action={
          <span
            className={cn(
              "chip",
              cam.personDetected
                ? "border-danger/50 bg-danger/15 text-danger"
                : online
                  ? "border-ok/40 bg-ok/15 text-ok"
                  : "border-slate-500/40 bg-slate-500/10 text-slate-400",
            )}
          >
            {cam.personDetected ? "Person Detected" : online ? "Clear" : "Offline"}
          </span>
        }
      />
      <div className="p-4">
        <CameraView cam={cam} />

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">People</p>
            <p className="text-lg font-bold text-ai">{cam.peopleCount}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</p>
            <p className="text-lg font-bold text-white">{Math.round(cam.confidence * 100)}%</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Zone</p>
            <p className={cn("text-lg font-bold", cam.dangerZoneActive ? "text-critical" : "text-slate-400")}>
              {cam.dangerZoneActive ? "Danger" : "Safe"}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => actions.setCameraDetection(cam.id, true, 1)}
            disabled={!online}
            className="btn-primary text-xs"
          >
            <UserCheck className="h-3.5 w-3.5" /> Detect Person
          </button>
          <button
            onClick={() => actions.setCameraDetection(cam.id, true, 4)}
            disabled={!online}
            className="btn-danger text-xs"
          >
            <Users className="h-3.5 w-3.5" /> Multiple
          </button>
          <button onClick={() => actions.clearCameraDetection(cam.id)} className="btn-ghost text-xs">
            <XCircle className="h-3.5 w-3.5" /> Clear
          </button>
          <button
            onClick={() => actions.setCameraStatus(cam.id, online ? "Offline" : "Online")}
            className="btn-ghost text-xs"
          >
            <Power className="h-3.5 w-3.5" /> {online ? "Offline" : "Online"}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export function CameraDetection() {
  const { cameras } = useAppState();
  const actions = useActions();
  const detecting = cameras.filter((c) => c.personDetected).length;
  const [active, setActive] = useState(0);
  const activeCam = cameras[active] ?? cameras[0];

  return (
    <div>
      <PageHeader
        title="AI Camera Detection"
        subtitle="Person detection, people counting and danger-zone overlays. The module is structured so a real YOLO / OpenCV RTSP pipeline drops in without UI changes."
        actions={
          <span className={cn("chip text-sm", detecting > 0 ? "border-danger/50 bg-danger/15 text-danger" : "border-ok/40 bg-ok/15 text-ok")}>
            <Scan className="h-4 w-4" /> {detecting} camera(s) detecting
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Featured large preview */}
        <div className="lg:col-span-2">
          <GlassCard className={cn(activeCam.personDetected && "border-danger/40 shadow-glow-danger")}>
            <CardHeader
              title="Primary Feed"
              subtitle={`${activeCam.location} · ${activeCam.id}`}
              icon={<Activity className="h-4 w-4" />}
              action={
                <div className="flex gap-1">
                  {cameras.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setActive(i)}
                      className={cn(
                        "rounded-lg px-2 py-1 font-mono text-[10px]",
                        i === active ? "bg-ai/20 text-ai" : "bg-white/5 text-slate-400 hover:text-white",
                      )}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="p-4">
              <CameraView cam={activeCam} />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => actions.setCameraDetection(activeCam.id, true, 1)} disabled={activeCam.status === "Offline"} className="btn-primary text-xs">
                  <UserCheck className="h-3.5 w-3.5" /> Simulate Person Detection
                </button>
                <button onClick={() => actions.setCameraDetection(activeCam.id, true, 5)} disabled={activeCam.status === "Offline"} className="btn-danger text-xs">
                  <Users className="h-3.5 w-3.5" /> Simulate Multiple People
                </button>
                <button onClick={() => actions.clearCameraDetection(activeCam.id)} className="btn-ghost text-xs">
                  <XCircle className="h-3.5 w-3.5" /> Clear Detection
                </button>
              </div>
            </div>
          </GlassCard>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-ai/20 bg-ai/5 px-4 py-3 text-sm text-slate-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-ai" />
            When a camera linked to a checkpoint detects a person and that checkpoint
            registers an IR crossing, the fusion engine instantly raises an{" "}
            <span className="font-semibold text-danger">AI + IR Critical</span> report.
          </div>
        </div>

        {/* Camera grid */}
        <div className="space-y-4">
          {cameras.map((cam) => (
            <CameraPanel key={cam.id} cam={cam} />
          ))}
        </div>
      </div>
    </div>
  );
}
