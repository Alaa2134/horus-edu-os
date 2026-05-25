import { useState } from "react";
import {
  Cpu,
  Camera,
  Battery,
  Bell,
  BellOff,
  Lightbulb,
  RotateCcw,
  Radio,
  Power,
  Plug,
  Link2,
  Code2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { useActions, useAppState } from "@/store/useStore";
import { cn, timeAgo } from "@/lib/utils";
import type { CheckpointDevice } from "@/types";
import { Esp32Modal } from "@/components/Esp32Modal";

function DeviceCard({ device }: { device: CheckpointDevice }) {
  const actions = useActions();
  const cameras = useAppState().cameras;
  const linkedCam = cameras.find((c) => c.id === device.linkedCameraId);
  const online = device.status === "Online";

  const Stat = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
    <div className="rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("text-sm font-bold text-white", accent)}>{value}</p>
    </div>
  );

  return (
    <GlassCard
      className={cn(
        "overflow-hidden",
        device.irStatus === "Triggered" && "border-critical/50 shadow-glow-critical",
      )}
    >
      <div className="flex items-start justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10",
              online ? "bg-ai/10 text-ai" : "bg-white/5 text-slate-500",
              device.irStatus === "Triggered" && "animate-pulse-ring bg-critical/15 text-critical",
            )}
          >
            <Cpu className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">{device.location}</p>
            <p className="font-mono text-[10px] text-slate-500">{device.id}</p>
          </div>
        </div>
        <span
          className={cn(
            "chip",
            online ? "border-ok/40 bg-ok/15 text-ok" : "border-slate-500/40 bg-slate-500/10 text-slate-400",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-ok" : "bg-slate-500")} />
          {device.status}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label="IR Status"
            value={device.irStatus}
            accent={device.irStatus === "Triggered" ? "text-critical" : "text-slate-300"}
          />
          <Stat label="Crossings" value={String(device.crossingsToday)} accent="text-ai" />
          <Stat label="Risk +" value={String(device.riskContribution)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2 text-xs">
            <Battery
              className={cn(
                "h-4 w-4",
                device.battery > 50 ? "text-ok" : device.battery > 20 ? "text-critical" : "text-danger",
              )}
            />
            <span className="text-slate-300">{device.battery}%</span>
            <span className="ml-auto flex items-center gap-1 text-slate-500">
              <Plug className="h-3 w-3" /> {device.powerSource}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2 text-xs">
            <Link2 className="h-4 w-4 text-slate-500" />
            <span className="truncate text-slate-300">
              {linkedCam ? linkedCam.id : "No camera"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <Bell className={cn("h-4 w-4", device.buzzerStatus === "On" ? "text-critical animate-blink" : "text-slate-500")} />
            Buzzer {device.buzzerStatus}
          </span>
          <span className="flex items-center gap-1.5">
            <Lightbulb className={cn("h-4 w-4", device.ledStatus === "On" ? "text-critical animate-blink" : "text-slate-500")} />
            LED {device.ledStatus}
          </span>
          <span className="text-slate-500">{timeAgo(device.lastTriggered)}</span>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => actions.simulateIrCrossing(device.id)}
            disabled={!online}
            className="btn-primary text-xs"
          >
            <Radio className="h-3.5 w-3.5" /> Simulate IR
          </button>
          {device.buzzerStatus === "On" ? (
            <button onClick={() => actions.silenceAlarm(device.id)} className="btn-ghost text-xs">
              <BellOff className="h-3.5 w-3.5" /> Silence
            </button>
          ) : (
            <button onClick={() => actions.triggerAlarm(device.id)} disabled={!online} className="btn-critical text-xs">
              <Bell className="h-3.5 w-3.5" /> Trigger Alarm
            </button>
          )}
          <button onClick={() => actions.resetCheckpointCounter(device.id)} className="btn-ghost text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            onClick={() => actions.setCheckpointStatus(device.id, online ? "Offline" : "Online")}
            className="btn-ghost text-xs"
          >
            <Power className="h-3.5 w-3.5" /> {online ? "Set Offline" : "Set Online"}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export function Checkpoints() {
  const { checkpoints } = useAppState();
  const [showEsp, setShowEsp] = useState(false);

  return (
    <div>
      <PageHeader
        title="Smart Checkpoints"
        subtitle="ESP32 + IR sensor devices. Each crossing feeds the fusion engine — pair with a camera detection for instant critical escalation."
        actions={
          <button onClick={() => setShowEsp(true)} className="btn-ghost text-sm">
            <Code2 className="h-4 w-4" /> ESP32 Wiring & Code
          </button>
        }
      />

      <div className="mb-5 flex items-center gap-3 rounded-xl border border-ai/20 bg-ai/5 px-4 py-3 text-sm text-slate-300">
        <Camera className="h-4 w-4 shrink-0 text-ai" />
        Tip: turn on a camera detection first, then simulate an IR crossing on the
        same location to watch an <span className="font-semibold text-danger">AI + IR Critical</span> alert form.
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {checkpoints.map((d) => (
          <DeviceCard key={d.id} device={d} />
        ))}
      </div>

      {showEsp && <Esp32Modal onClose={() => setShowEsp(false)} />}
    </div>
  );
}
