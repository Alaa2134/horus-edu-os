import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Camera,
  Cpu,
  Brain,
  Lightbulb,
  Users,
  UserPlus,
  Truck,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { PriorityBadge, SourceBadge, StatusBadge } from "@/components/ui/Badge";
import { Timeline } from "@/components/Timeline";
import { useActions, useAppState } from "@/store/useStore";
import { calculateRiskScore } from "@/lib/riskEngine";
import { cn, formatDateTime } from "@/lib/utils";

export function ReportDetails() {
  const { id } = useParams();
  const state = useAppState();
  const actions = useActions();
  const report = state.reports.find((r) => r.id === id);
  const [teamId, setTeamId] = useState("");

  if (!report) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-white">Report not found</p>
        <Link to="/app/reports" className="btn-primary mt-4 inline-flex">
          Back to reports
        </Link>
      </div>
    );
  }

  // Recompute factor breakdown for the explainability panel.
  const factors = calculateRiskScore({
    cameraPersonDetected: !!report.cameraEvidence,
    peopleCount: report.cameraEvidence?.peopleCount ?? report.affectedPeople ?? 0,
    irTriggered: !!report.irEvidence,
    inDangerZone: report.cameraEvidence?.dangerZone ?? false,
    repeatedCrossing: report.irEvidence?.repeated ?? false,
    emergencyType: report.type,
    locationRisk: "medium",
    trapped: report.trapped,
    medicalNeeded: report.medicalNeeded,
  }).factors;

  const relatedEvents = state.timeline.filter(
    (e) =>
      e.description.includes(report.id) ||
      e.title.includes(report.id) ||
      e.description.includes(report.location),
  );

  const available = state.teams.filter(
    (t) => t.status === "Available" || t.name === report.assignedTeam,
  );

  return (
    <div className="space-y-6">
      <Link
        to="/app/reports"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to reports
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-slate-500">{report.id}</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {report.type}
            </h1>
            <PriorityBadge priority={report.priority} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {report.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {formatDateTime(report.createdAt)}
            </span>
            <SourceBadge source={report.source} />
            <StatusBadge status={report.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <GlassCard>
            <CardHeader title="Incident Description" icon={<Users className="h-4 w-4" />} />
            <div className="space-y-3 p-5">
              <p className="text-sm text-slate-300">{report.description}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Affected", value: report.affectedPeople ?? 0 },
                  { label: "Trapped", value: report.trapped ? "Yes" : "No" },
                  { label: "Medical", value: report.medicalNeeded ? "Needed" : "No" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-white/5 bg-bg-800/50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
                    <p className="text-sm font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* AI explanation + factors */}
          <GlassCard glow="shadow-glow">
            <CardHeader title="AI Risk Explanation" icon={<Brain className="h-4 w-4" />} />
            <div className="space-y-4 p-5">
              <p className="text-sm text-slate-300">{report.aiExplanation}</p>
              <div className="space-y-2">
                <p className="panel-title">Score breakdown</p>
                {factors.length === 0 && (
                  <p className="text-xs text-slate-500">No contributing risk factors.</p>
                )}
                {factors.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="flex-1 text-xs text-slate-300">{f.label}</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-ai"
                        style={{ width: `${Math.min(100, f.points * 3)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-xs font-bold text-ai">
                      +{f.points}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-critical/30 bg-critical/10 p-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-critical" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-critical">
                    Recommended action
                  </p>
                  <p className="text-sm text-slate-200">{report.recommendation}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Evidence */}
          <div className="grid gap-6 sm:grid-cols-2">
            <GlassCard className={report.cameraEvidence ? "border-ai/30" : ""}>
              <CardHeader title="Camera Evidence" icon={<Camera className="h-4 w-4" />} />
              <div className="p-5">
                {report.cameraEvidence ? (
                  <>
                    <div className="relative mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black scan-grid">
                      <div className="absolute inset-x-6 inset-y-8 rounded border-2 border-danger shadow-[0_0_12px_rgba(255,59,59,0.6)]">
                        <span className="absolute -top-5 left-0 rounded bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                          person {Math.round(report.cameraEvidence.confidence * 100)}%
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-500">
                        {report.cameraEvidence.snapshotLabel}
                      </span>
                    </div>
                    <dl className="space-y-1 text-xs">
                      <Row k="Camera" v={report.cameraEvidence.cameraId} />
                      <Row k="People" v={String(report.cameraEvidence.peopleCount)} />
                      <Row k="Confidence" v={`${Math.round(report.cameraEvidence.confidence * 100)}%`} />
                      <Row k="Danger zone" v={report.cameraEvidence.dangerZone ? "Yes" : "No"} />
                    </dl>
                  </>
                ) : (
                  <p className="py-6 text-center text-sm text-slate-500">No camera evidence.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className={report.irEvidence ? "border-critical/30" : ""}>
              <CardHeader title="IR Checkpoint Evidence" icon={<Cpu className="h-4 w-4" />} />
              <div className="p-5">
                {report.irEvidence ? (
                  <dl className="space-y-1 text-xs">
                    <Row k="Device" v={report.irEvidence.deviceId} />
                    <Row k="Crossings" v={String(report.irEvidence.crossings)} />
                    <Row k="Repeated" v={report.irEvidence.repeated ? "Yes" : "No"} />
                    <Row k="Last trigger" v={formatDateTime(report.irEvidence.lastTriggered)} />
                  </dl>
                ) : (
                  <p className="py-6 text-center text-sm text-slate-500">No IR evidence.</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Timeline */}
          <GlassCard>
            <CardHeader title="Incident Timeline" icon={<Clock className="h-4 w-4" />} />
            <Timeline events={relatedEvents.length ? relatedEvents : state.timeline} limit={10} />
          </GlassCard>
        </div>

        {/* Sidebar: risk + actions */}
        <div className="space-y-6">
          <GlassCard className="flex flex-col items-center p-6" glow="shadow-glow-critical">
            <p className="panel-title mb-3">Risk Score</p>
            <RiskMeter score={report.riskScore} size={150} />
            <p className="mt-3 text-center text-xs text-slate-400">
              Fused from {report.source} signals
            </p>
          </GlassCard>

          <GlassCard>
            <CardHeader title="Response" icon={<Truck className="h-4 w-4" />} />
            <div className="space-y-3 p-5">
              <div>
                <p className="panel-title mb-1.5">Assigned team</p>
                <p className="text-sm font-semibold text-white">
                  {report.assignedTeam ?? "Unassigned"}
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="input-field py-2 text-xs"
                >
                  <option value="" className="bg-bg-800">Select team…</option>
                  {available.map((t) => (
                    <option key={t.id} value={t.id} className="bg-bg-800">
                      {t.name} ({t.type})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => teamId && actions.assignTeam(report.id, teamId)}
                  disabled={!teamId}
                  className="btn-primary shrink-0 px-3 text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Assign
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => actions.updateReportStatus(report.id, "En Route")}
                  className={cn("btn-ghost text-xs", report.status === "En Route" && "border-critical/50 text-critical")}
                >
                  <Truck className="h-3.5 w-3.5" /> En Route
                </button>
                <button
                  onClick={() => actions.updateReportStatus(report.id, "On Scene")}
                  className={cn("btn-ghost text-xs", report.status === "On Scene" && "border-ai/50 text-ai")}
                >
                  <MapPin className="h-3.5 w-3.5" /> On Scene
                </button>
                <button
                  onClick={() => actions.updateReportStatus(report.id, "Resolved")}
                  className="btn-success text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                </button>
                <button onClick={() => actions.escalateReport(report.id)} className="btn-critical text-xs">
                  <TrendingUp className="h-3.5 w-3.5" /> Escalate
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-0">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-mono font-semibold text-white">{v}</dd>
    </div>
  );
}
