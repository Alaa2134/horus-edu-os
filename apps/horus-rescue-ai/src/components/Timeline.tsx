import type { TimelineEvent } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import {
  Camera,
  Cpu,
  FileText,
  Layers,
  Radio,
  Users,
} from "lucide-react";

const ICONS = {
  report: FileText,
  ir: Cpu,
  camera: Camera,
  fusion: Layers,
  team: Users,
  system: Radio,
} as const;

const SEVERITY = {
  critical: "text-critical bg-critical/15 border-critical/40",
  warning: "text-danger bg-danger/15 border-danger/40",
  success: "text-ok bg-ok/15 border-ok/40",
  info: "text-ai bg-ai/15 border-ai/40",
} as const;

export function Timeline({
  events,
  limit,
}: {
  events: TimelineEvent[];
  limit?: number;
}) {
  const list = limit ? events.slice(0, limit) : events;
  if (list.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-slate-500">
        No events yet. Run a simulation or trigger a sensor.
      </p>
    );
  }
  return (
    <ol className="relative space-y-1 px-5 py-4">
      <span className="absolute left-[34px] top-4 bottom-4 w-px bg-white/10" />
      {list.map((ev) => {
        const Icon = ICONS[ev.type];
        return (
          <li key={ev.id} className="relative flex gap-3 py-2">
            <span
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                SEVERITY[ev.severity],
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {ev.title}
                </p>
                <span className="shrink-0 font-mono text-[10px] text-slate-500">
                  {formatTime(ev.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-400">{ev.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
