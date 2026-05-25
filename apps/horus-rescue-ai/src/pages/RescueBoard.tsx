import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, GripVertical, Users, Flame, Heart, Shield, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { PriorityBadge } from "@/components/ui/Badge";
import { useActions, useAppState } from "@/store/useStore";
import { cn, timeAgo } from "@/lib/utils";
import type { EmergencyReport, ReportStatus, RescueTeamType } from "@/types";

const COLUMNS: { status: ReportStatus; accent: string }[] = [
  { status: "New", accent: "border-t-slate-500" },
  { status: "Assigned", accent: "border-t-info" },
  { status: "En Route", accent: "border-t-critical" },
  { status: "On Scene", accent: "border-t-ai" },
  { status: "Resolved", accent: "border-t-ok" },
];

const TEAM_ICON: Record<RescueTeamType, typeof Flame> = {
  Fire: Flame,
  Medical: Heart,
  Security: Shield,
  Rescue: LifeBuoy,
};

function KanbanCard({
  report,
  onDragStart,
}: {
  report: EmergencyReport;
  onDragStart: (id: string) => void;
}) {
  return (
    <Link
      to={`/app/reports/${report.id}`}
      draggable
      onDragStart={() => onDragStart(report.id)}
      className={cn(
        "group block rounded-xl border border-white/10 bg-bg-800/70 p-3 transition-all hover:border-white/25 hover:bg-bg-700/70",
        report.priority === "Critical" && "border-critical/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{report.type}</p>
          <p className="font-mono text-[10px] text-slate-500">{report.id}</p>
        </div>
        <GripVertical className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-slate-400" />
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin className="h-3 w-3" /> <span className="truncate">{report.location}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <PriorityBadge priority={report.priority} />
        <span className="font-mono text-xs font-bold text-white">{report.riskScore}</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-slate-500">
        <span className="truncate">{report.assignedTeam ?? "Unassigned"}</span>
        <span>{timeAgo(report.createdAt)}</span>
      </div>
    </Link>
  );
}

export function RescueBoard() {
  const state = useAppState();
  const actions = useActions();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ReportStatus | null>(null);

  const drop = (status: ReportStatus) => {
    if (dragId) actions.updateReportStatus(dragId, status);
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div>
      <PageHeader
        title="Rescue Team Board"
        subtitle="Drag incident cards across the workflow. Resolving a card frees its team."
      />

      {/* Team roster */}
      <GlassCard className="mb-5 p-4">
        <p className="panel-title mb-3 flex items-center gap-2">
          <Users className="h-3.5 w-3.5" /> Team roster
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {state.teams.map((t) => {
            const Icon = TEAM_ICON[t.type];
            const busy = t.status !== "Available";
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5",
                  busy ? "border-critical/30 bg-critical/5" : "border-ok/30 bg-ok/5",
                )}
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", busy ? "bg-critical/15 text-critical" : "bg-ok/15 text-ok")}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[10px] text-slate-500">{t.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = state.reports
            .filter((r) => r.status === col.status)
            .sort((a, b) => b.riskScore - a.riskScore);
          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.status);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.status ? null : c))}
              onDrop={() => drop(col.status)}
              className={cn(
                "flex min-h-[200px] flex-col rounded-2xl border border-t-2 border-white/10 bg-white/[0.02] transition-colors",
                col.accent,
                overCol === col.status && "bg-ai/5 ring-1 ring-ai/40",
              )}
            >
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-sm font-bold text-white">{col.status}</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 text-[10px] font-bold text-slate-300">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 px-2.5 pb-3">
                {items.map((r) => (
                  <KanbanCard key={r.id} report={r} onDragStart={setDragId} />
                ))}
                {items.length === 0 && (
                  <p className="px-2 py-8 text-center text-xs text-slate-600">Drop here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
