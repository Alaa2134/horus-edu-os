import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Siren,
  MapPin,
  Users,
  AlertTriangle,
  Heart,
  Send,
  Brain,
  CheckCircle2,
  FileText,
  Map as MapIcon,
  Activity,
  LifeBuoy,
  User,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { useActions, useAppState } from "@/store/useStore";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { LOCATIONS } from "@/data/seed";
import { cn, timeAgo } from "@/lib/utils";
import type { EmergencyReport, EmergencyType } from "@/types";

const TYPES: EmergencyType[] = [
  "Fire",
  "Medical",
  "Trapped Person",
  "Structural Collapse",
  "Flood",
  "Gas Leak",
  "Stampede",
  "Security Threat",
  "Unknown",
];

type Tab = "report" | "map" | "status" | "help" | "profile";

function ReportTab() {
  const actions = useActions();
  const [type, setType] = useState<EmergencyType>("Medical");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [affected, setAffected] = useState(1);
  const [trapped, setTrapped] = useState(false);
  const [medical, setMedical] = useState(true);
  const [phase, setPhase] = useState<"form" | "analyzing" | "result">("form");
  const [result, setResult] = useState<EmergencyReport | null>(null);

  const submit = () => {
    setPhase("analyzing");
    setTimeout(() => {
      const r = actions.postManualReport({
        type,
        location,
        description,
        affectedPeople: affected,
        trapped,
        medicalNeeded: medical,
      });
      setResult(r);
      setPhase("result");
    }, 1600);
  };

  const reset = () => {
    setPhase("form");
    setResult(null);
    setDescription("");
  };

  if (phase === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-ai/30 border-t-ai" />
          <Brain className="h-9 w-9 animate-blink text-ai" />
        </div>
        <p className="text-lg font-bold text-white">AI analyzing your report…</p>
        <p className="text-sm text-slate-400">Computing risk score & priority</p>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="space-y-5 py-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-12 w-12 text-ok" />
          <div>
            <p className="text-lg font-bold text-white">Report submitted</p>
            <p className="font-mono text-sm text-slate-400">{result.id}</p>
          </div>
        </div>
        <div className="glass flex flex-col items-center gap-3 p-5">
          <RiskMeter score={result.riskScore} size={140} />
          <PriorityBadge priority={result.priority} />
          <p className="text-center text-sm text-slate-300">{result.aiExplanation}</p>
          <div className="w-full rounded-xl border border-critical/30 bg-critical/10 p-3 text-sm text-slate-200">
            <span className="font-semibold text-critical">Recommended: </span>
            {result.recommendation}
          </div>
        </div>
        <p className="text-center text-xs text-slate-500">
          Your report is now live on the command dashboard.
        </p>
        <button onClick={reset} className="btn-primary w-full">
          File another report
        </button>
        <Link to="/app/reports/" className="btn-ghost w-full">
          <FileText className="h-4 w-4" /> View on dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Emergency type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((tp) => (
            <button
              key={tp}
              onClick={() => setType(tp)}
              className={cn(
                "rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors",
                type === tp
                  ? "border-ai bg-ai/15 text-ai"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25",
              )}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's happening?"
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          <MapPin className="mr-1 inline h-3.5 w-3.5" /> Location
        </label>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="input-field">
          {LOCATIONS.map((l) => (
            <option key={l} value={l} className="bg-bg-800">
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Users className="mr-1 inline h-3.5 w-3.5" /> Affected people: {affected}
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={affected}
          onChange={(e) => setAffected(Number(e.target.value))}
          className="w-full accent-ai"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTrapped((v) => !v)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold",
            trapped ? "border-critical bg-critical/15 text-critical" : "border-white/10 bg-white/5 text-slate-300",
          )}
        >
          <AlertTriangle className="h-4 w-4" /> Trapped?
        </button>
        <button
          onClick={() => setMedical((v) => !v)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold",
            medical ? "border-danger bg-danger/15 text-danger" : "border-white/10 bg-white/5 text-slate-300",
          )}
        >
          <Heart className="h-4 w-4" /> Medical?
        </button>
      </div>

      <button onClick={submit} className="btn-danger w-full py-3.5 text-base">
        <Send className="h-5 w-5" /> Submit Emergency Report
      </button>
    </div>
  );
}

function StatusTab() {
  const { reports } = useAppState();
  const recent = [...reports].slice(0, 8);
  return (
    <div className="space-y-3 py-2">
      <p className="text-sm font-semibold text-white">Recent reports</p>
      {recent.map((r) => (
        <Link
          key={r.id}
          to={`/app/reports/${r.id}`}
          className="glass flex items-center gap-3 p-3"
        >
          <RiskMeter score={r.riskScore} size={52} showLabel={false} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{r.type}</p>
            <p className="truncate text-xs text-slate-400">{r.location}</p>
            <div className="mt-1 flex items-center gap-2">
              <PriorityBadge priority={r.priority} />
              <span className="text-[10px] text-slate-500">{timeAgo(r.createdAt)}</span>
            </div>
          </div>
          <StatusBadge status={r.status} />
        </Link>
      ))}
    </div>
  );
}

function MapTab() {
  const { cameras, checkpoints } = useAppState();
  return (
    <div className="space-y-4 py-2">
      <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-bg-800 scan-grid">
        <div className="absolute inset-0 bg-radial-glow" />
        {[...cameras, ...checkpoints].slice(0, 6).map((d, i) => (
          <span
            key={d.id}
            className="absolute flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: `${15 + (i % 3) * 32}%`, top: `${25 + Math.floor(i / 3) * 40}%` }}
          >
            <span className="absolute h-6 w-6 animate-ping rounded-full bg-ai/30" />
            <span className="h-3 w-3 rounded-full bg-ai" />
          </span>
        ))}
        <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-slate-300">
          Live device map · {cameras.length + checkpoints.length} nodes
        </span>
      </div>
      <p className="text-xs text-slate-400">
        GPS rescue routing and live device geolocation are on the roadmap. This map
        shows checkpoint & camera nodes feeding the fusion engine.
      </p>
    </div>
  );
}

function HelpTab() {
  return (
    <div className="space-y-3 py-2">
      <a href="tel:911" className="btn-danger w-full py-4 text-lg">
        <Phone className="h-5 w-5" /> Call Emergency Services
      </a>
      {[
        { q: "When should I report?", a: "Any fire, medical emergency, trapped person, or dangerous situation." },
        { q: "What happens after I submit?", a: "AI scores your report and it appears instantly on the command dashboard for dispatch." },
        { q: "Is hardware required?", a: "No — the app works fully in demo mode. Camera + IR checkpoints enhance accuracy." },
      ].map((f) => (
        <div key={f.q} className="glass p-4">
          <p className="text-sm font-semibold text-white">{f.q}</p>
          <p className="mt-1 text-xs text-slate-400">{f.a}</p>
        </div>
      ))}
    </div>
  );
}

function ProfileTab() {
  const { settings } = useAppState();
  return (
    <div className="space-y-4 py-2">
      <div className="glass flex items-center gap-3 p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ai to-danger text-bg-900">
          <User className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-white">Field Reporter</p>
          <p className="text-xs text-slate-400">{settings.organizationName}</p>
        </div>
      </div>
      <div className="glass divide-y divide-white/5">
        {[
          { k: "Mode", v: settings.mode },
          { k: "Sound alerts", v: settings.soundAlerts ? "On" : "Off" },
          { k: "Auto-assign teams", v: settings.autoAssignTeams ? "On" : "Off" },
        ].map((row) => (
          <div key={row.k} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-slate-400">{row.k}</span>
            <span className="font-semibold text-white">{row.v}</span>
          </div>
        ))}
      </div>
      <Link to="/app" className="btn-primary w-full">
        Open Command Center
      </Link>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "report", label: "Report", icon: Siren },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "status", label: "Status", icon: Activity },
  { id: "help", label: "Help", icon: LifeBuoy },
  { id: "profile", label: "Profile", icon: User },
];

export function MobileReport() {
  const [tab, setTab] = useState<Tab>("report");

  return (
    <div className="flex min-h-screen justify-center bg-bg">
      <div className="relative flex w-full max-w-md flex-col">
        {/* App bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-bg-900/80 px-4 py-3.5 backdrop-blur-xl">
          <Link to="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ai to-danger text-bg-900">
              <Siren className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">Horus Rescue</p>
              <p className="text-[10px] uppercase tracking-widest text-ai">Mobile Report</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-24">
          {tab === "report" && <ReportTab />}
          {tab === "map" && <MapTab />}
          {tab === "status" && <StatusTab />}
          {tab === "help" && <HelpTab />}
          {tab === "profile" && <ProfileTab />}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 z-20 w-full max-w-md border-t border-white/10 bg-bg-900/90 backdrop-blur-xl">
          <div className="grid grid-cols-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors",
                    active ? "text-ai" : "text-slate-500",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]")} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
