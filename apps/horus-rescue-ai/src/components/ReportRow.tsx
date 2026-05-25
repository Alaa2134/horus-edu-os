import { Link } from "react-router-dom";
import { MapPin, ChevronRight, Users } from "lucide-react";
import type { EmergencyReport } from "@/types";
import { PriorityBadge, SourceBadge, StatusBadge } from "@/components/ui/Badge";
import { RiskBar } from "@/components/ui/RiskMeter";
import { timeAgo, cn } from "@/lib/utils";
import { priorityColor } from "@/lib/riskEngine";

export function ReportRow({ report }: { report: EmergencyReport }) {
  const pc = priorityColor(report.priority);
  return (
    <Link
      to={`/app/reports/${report.id}`}
      className={cn(
        "group flex flex-col gap-3 border-l-2 px-4 py-3.5 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center",
        report.priority === "Critical"
          ? "border-l-critical"
          : report.priority === "High"
            ? "border-l-danger"
            : report.priority === "Medium"
              ? "border-l-ai"
              : "border-l-ok",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-500">{report.id}</span>
          <span className="text-sm font-semibold text-white">{report.type}</span>
          <PriorityBadge priority={report.priority} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {report.location}
          </span>
          {report.affectedPeople ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {report.affectedPeople}
            </span>
          ) : null}
          <span>{timeAgo(report.createdAt)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <SourceBadge source={report.source} />
          <StatusBadge status={report.status} />
          {report.assignedTeam && (
            <span className="chip border-white/10 bg-white/5 text-slate-300">
              {report.assignedTeam}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:w-48">
        <div className="flex-1">
          <RiskBar score={report.riskScore} />
        </div>
        <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5", pc.text)} />
      </div>
    </Link>
  );
}
