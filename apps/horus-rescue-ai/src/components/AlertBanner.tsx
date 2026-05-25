import { Link } from "react-router-dom";
import { Siren, ArrowRight } from "lucide-react";
import type { EmergencyReport } from "@/types";

export function AlertBanner({ report }: { report: EmergencyReport | null }) {
  if (!report) {
    return (
      <div className="glass flex items-center gap-3 border-ok/30 px-5 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ok/15 text-ok">
          <Siren className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ok">All clear</p>
          <p className="text-xs text-slate-400">
            No critical incidents in the active queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/app/reports/${report.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-critical/50 bg-critical/10 px-5 py-3.5 shadow-glow-critical animate-pulse-ring"
    >
      <span className="absolute inset-0 -z-10 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,138,0,0.18),transparent)] bg-[length:200%_100%]" />
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-critical/20 text-critical">
        <Siren className="h-6 w-6 animate-blink" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-critical">
          Critical alert · {report.id}
        </p>
        <p className="truncate text-sm font-semibold text-white">
          {report.type} at {report.location} — risk {report.riskScore}
        </p>
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-critical group-hover:text-orange-300 sm:flex">
        Respond <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
