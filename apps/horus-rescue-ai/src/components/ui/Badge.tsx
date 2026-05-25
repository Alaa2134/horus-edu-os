import { cn } from "@/lib/utils";
import type { Priority, ReportSource, ReportStatus } from "@/types";
import {
  Camera,
  Cpu,
  Layers,
  Hand,
} from "lucide-react";
import type { ReactNode } from "react";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    Critical: "border-critical/50 bg-critical/15 text-critical",
    High: "border-danger/50 bg-danger/15 text-danger",
    Medium: "border-ai/40 bg-ai/15 text-ai",
    Low: "border-ok/40 bg-ok/15 text-ok",
  };
  return (
    <span className={cn("chip", map[priority])}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          priority === "Critical" && "animate-blink bg-critical",
          priority === "High" && "bg-danger",
          priority === "Medium" && "bg-ai",
          priority === "Low" && "bg-ok",
        )}
      />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, string> = {
    New: "border-slate-500/40 bg-slate-500/10 text-slate-300",
    Assigned: "border-info/40 bg-info/15 text-info",
    "En Route": "border-critical/40 bg-critical/15 text-critical",
    "On Scene": "border-ai/40 bg-ai/15 text-ai",
    Resolved: "border-ok/40 bg-ok/15 text-ok",
  };
  return <span className={cn("chip", map[status])}>{status}</span>;
}

const sourceMeta: Record<ReportSource, { icon: ReactNode; cls: string }> = {
  Manual: { icon: <Hand className="h-3 w-3" />, cls: "border-slate-500/40 bg-slate-500/10 text-slate-300" },
  "Camera AI": { icon: <Camera className="h-3 w-3" />, cls: "border-ai/40 bg-ai/15 text-ai" },
  "IR Checkpoint": { icon: <Cpu className="h-3 w-3" />, cls: "border-critical/40 bg-critical/15 text-critical" },
  "AI+IR Fusion": { icon: <Layers className="h-3 w-3" />, cls: "border-danger/50 bg-danger/15 text-danger" },
};

export function SourceBadge({ source }: { source: ReportSource }) {
  const meta = sourceMeta[source];
  return (
    <span className={cn("chip", meta.cls)}>
      {meta.icon}
      {source}
    </span>
  );
}
