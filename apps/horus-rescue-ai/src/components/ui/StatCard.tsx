import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "ai" | "danger" | "critical" | "ok" | "info";
  hint?: string;
  pulse?: boolean;
}

const accentMap = {
  ai: { text: "text-ai", ring: "shadow-glow", bg: "bg-ai/10" },
  danger: { text: "text-danger", ring: "shadow-glow-danger", bg: "bg-danger/10" },
  critical: { text: "text-critical", ring: "shadow-glow-critical", bg: "bg-critical/10" },
  ok: { text: "text-ok", ring: "", bg: "bg-ok/10" },
  info: { text: "text-info", ring: "", bg: "bg-info/10" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "ai",
  hint,
  pulse,
}: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div
      className={cn(
        "glass animate-fade-up p-4 transition-transform hover:-translate-y-0.5",
        pulse && a.ring,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="panel-title">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            a.bg,
            a.text,
            pulse && "animate-pulse-ring",
          )}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
        </span>
      </div>
      <p className={cn("stat-value mt-2", a.text)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
