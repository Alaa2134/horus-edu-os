import { Link } from "react-router-dom";
import {
  FileText,
  Siren,
  Cpu,
  Camera,
  Radio,
  Gauge,
  Users,
  Layers,
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Tooltip,
} from "recharts";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { AlertBanner } from "@/components/AlertBanner";
import { Timeline } from "@/components/Timeline";
import { ReportRow } from "@/components/ReportRow";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { useActions, useAppState } from "@/store/useStore";
import { useMetrics } from "@/hooks/useMetrics";
import { cn } from "@/lib/utils";

const SOURCE_COLORS: Record<string, string> = {
  Manual: "#94A3B8",
  "Camera AI": "#00E5FF",
  "IR Checkpoint": "#FF8A00",
  "AI+IR Fusion": "#FF3B3B",
};

export function Dashboard() {
  const state = useAppState();
  const actions = useActions();
  const m = useMetrics();

  const sourceData = Object.entries(
    state.reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.source] = (acc[r.source] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const priorityData = (["Critical", "High", "Medium", "Low"] as const).map(
    (p) => ({ name: p, value: m.byPriority[p] }),
  );
  const priorityColors = ["#FF8A00", "#FF3B3B", "#00E5FF", "#22C55E"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Command Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Live emergency operations · {state.settings.organizationName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => actions.generateCriticalScenario()}
            className="btn-critical text-xs"
          >
            <Zap className="h-4 w-4" /> Generate Critical
          </button>
          <Link to="/app/simulation" className="btn-primary text-xs">
            <Radio className="h-4 w-4" /> Run Simulation
          </Link>
        </div>
      </div>

      <AlertBanner report={m.topCriticalReport} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total Reports" value={m.totalReports} icon={FileText} accent="ai" />
        <StatCard
          label="Critical Alerts"
          value={m.criticalAlerts}
          icon={Siren}
          accent="critical"
          pulse={m.criticalAlerts > 0}
        />
        <StatCard
          label="Active Checkpoints"
          value={`${m.activeCheckpoints}/${m.totalCheckpoints}`}
          icon={Cpu}
          accent="info"
        />
        <StatCard
          label="Camera AI"
          value={m.camerasDetecting > 0 ? "Detecting" : "Idle"}
          icon={Camera}
          accent={m.camerasDetecting > 0 ? "danger" : "ok"}
          hint={`${m.camerasOnline} online`}
          pulse={m.camerasDetecting > 0}
        />
        <StatCard label="IR Events Today" value={m.irEventsToday} icon={Radio} accent="critical" />
        <StatCard label="Avg Risk Score" value={m.averageRisk} icon={Gauge} accent="ai" />
        <StatCard
          label="Active Teams"
          value={`${m.activeTeams}/${m.totalTeams}`}
          icon={Users}
          accent="ok"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Fusion card */}
          <GlassCard glow={m.topCriticalReport ? "shadow-glow-critical" : "shadow-glow"}>
            <CardHeader
              title="AI + IR Risk Fusion"
              subtitle="Visual detection cross-confirmed by physical sensors"
              icon={<Layers className="h-4 w-4" />}
            />
            <div className="flex flex-col items-center gap-6 p-5 sm:flex-row">
              <RiskMeter score={m.topCriticalReport?.riskScore ?? m.averageRisk} size={140} />
              <div className="flex-1 space-y-3">
                {[
                  {
                    icon: Camera,
                    label: "Camera AI",
                    on: m.camerasDetecting > 0,
                    text:
                      m.camerasDetecting > 0
                        ? `${m.camerasDetecting} camera(s) detecting people`
                        : "No active visual detection",
                    color: "text-ai",
                  },
                  {
                    icon: Cpu,
                    label: "IR Checkpoints",
                    on: state.checkpoints.some((c) => c.irStatus === "Triggered"),
                    text: `${m.irEventsToday} crossings today across ${m.activeCheckpoints} active devices`,
                    color: "text-critical",
                  },
                  {
                    icon: Layers,
                    label: "Fusion verdict",
                    on: !!m.topCriticalReport,
                    text: m.topCriticalReport
                      ? `${m.topCriticalReport.priority}: ${m.topCriticalReport.recommendation}`
                      : "No fused critical events — situation nominal",
                    color: "text-danger",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5",
                        row.on ? row.color : "text-slate-500",
                      )}
                    >
                      <row.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{row.label}</p>
                      <p className="text-xs text-slate-400">{row.text}</p>
                    </div>
                    <span
                      className={cn(
                        "ml-auto mt-1 h-2 w-2 shrink-0 rounded-full",
                        row.on ? "animate-blink bg-ok" : "bg-slate-600",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Priority queue */}
          <GlassCard>
            <CardHeader
              title="Live Priority Queue"
              subtitle="Open incidents ranked by risk"
              icon={<Activity className="h-4 w-4" />}
              action={
                <Link to="/app/reports" className="text-xs font-semibold text-ai hover:text-cyan-300">
                  View all →
                </Link>
              }
            />
            <div className="divide-y divide-white/5">
              {m.openReports.slice(0, 6).map((r) => (
                <ReportRow key={r.id} report={r} />
              ))}
              {m.openReports.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  No open reports.
                </p>
              )}
            </div>
          </GlassCard>

          {/* Mini charts */}
          <div className="grid gap-6 sm:grid-cols-2">
            <GlassCard>
              <CardHeader title="Reports by Source" icon={<Camera className="h-4 w-4" />} />
              <div className="h-48 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {sourceData.map((entry) => (
                        <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] ?? "#64748B"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0B1020",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard>
              <CardHeader title="Reports by Priority" icon={<Gauge className="h-4 w-4" />} />
              <div className="h-48 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "#0B1020",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {priorityData.map((_, i) => (
                        <Cell key={i} fill={priorityColors[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Checkpoint status */}
          <GlassCard>
            <CardHeader
              title="Smart Checkpoints"
              icon={<Cpu className="h-4 w-4" />}
              action={
                <Link to="/app/checkpoints" className="text-xs font-semibold text-ai hover:text-cyan-300">
                  Manage →
                </Link>
              }
            />
            <ul className="divide-y divide-white/5">
              {state.checkpoints.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      c.status === "Online" ? "bg-ok" : "bg-slate-600",
                      c.irStatus === "Triggered" && "animate-blink bg-critical",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{c.location}</p>
                    <p className="font-mono text-[10px] text-slate-500">{c.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{c.crossingsToday}</p>
                    <p className="text-[10px] text-slate-500">crossings</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Camera status */}
          <GlassCard>
            <CardHeader
              title="Camera Detection"
              icon={<Camera className="h-4 w-4" />}
              action={
                <Link to="/app/cameras" className="text-xs font-semibold text-ai hover:text-cyan-300">
                  Open →
                </Link>
              }
            />
            <ul className="divide-y divide-white/5">
              {state.cameras.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10",
                      c.personDetected ? "bg-danger/15 text-danger" : "bg-white/5 text-slate-400",
                    )}
                  >
                    <Camera className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{c.location}</p>
                    <p className="text-[10px] text-slate-500">
                      {c.status === "Offline"
                        ? "Offline"
                        : c.personDetected
                          ? `${c.peopleCount} person(s) · ${Math.round(c.confidence * 100)}%`
                          : "Clear"}
                    </p>
                  </div>
                  {c.personDetected && (
                    <span className="chip border-danger/40 bg-danger/15 text-danger">Detected</span>
                  )}
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Rescue teams */}
          <GlassCard>
            <CardHeader
              title="Rescue Teams"
              icon={<Users className="h-4 w-4" />}
              action={
                <Link to="/app/rescue" className="text-xs font-semibold text-ai hover:text-cyan-300">
                  Board →
                </Link>
              }
            />
            <ul className="divide-y divide-white/5">
              {state.teams.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      t.status === "Available" ? "bg-ok" : "bg-critical",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.type}</p>
                  </div>
                  <span
                    className={cn(
                      "chip",
                      t.status === "Available"
                        ? "border-ok/40 bg-ok/15 text-ok"
                        : "border-critical/40 bg-critical/15 text-critical",
                    )}
                  >
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* Timeline full width */}
      <GlassCard>
        <CardHeader
          title="Event Timeline"
          subtitle="Live system, sensor and dispatch events"
          icon={<Activity className="h-4 w-4" />}
          action={
            <Link to="/app/analytics" className="flex items-center gap-1 text-xs font-semibold text-ai hover:text-cyan-300">
              Analytics <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <div className="max-h-96 overflow-y-auto">
          <Timeline events={state.timeline} limit={20} />
        </div>
      </GlassCard>
    </div>
  );
}
