import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radio,
  Zap,
  Camera,
  Cpu,
  Layers,
  RotateCcw,
  Brain,
  Siren,
  Activity,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { Timeline } from "@/components/Timeline";
import { useActions, useAppState } from "@/store/useStore";
import { useMetrics } from "@/hooks/useMetrics";
import { cn, pick } from "@/lib/utils";

const ANALYZE_STEPS = [
  "Ingesting sensor streams…",
  "Running camera person detection…",
  "Correlating IR checkpoint crossings…",
  "Fusing AI + IR signals…",
  "Computing risk scores…",
  "Ranking priority queue…",
];

function AnalyzeOverlay({ step }: { step: number }) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-bg-900/80 backdrop-blur-md">
      <div className="glass-strong w-full max-w-md p-8 text-center shadow-glow">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-ai/30 border-t-ai" />
          <Brain className="h-9 w-9 animate-blink text-ai" />
        </div>
        <p className="text-lg font-bold text-white">AI Engine Analyzing</p>
        <p className="mt-1 font-mono text-sm text-ai">{ANALYZE_STEPS[step]}</p>
        <div className="mt-5 space-y-1.5 text-left">
          {ANALYZE_STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "flex items-center gap-2 text-xs transition-opacity",
                i <= step ? "text-slate-200 opacity-100" : "text-slate-600 opacity-50",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", i < step ? "bg-ok" : i === step ? "animate-blink bg-ai" : "bg-slate-600")} />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  desc,
  onClick,
  variant = "ghost",
}: {
  icon: typeof Radio;
  title: string;
  desc: string;
  onClick: () => void;
  variant?: "ghost" | "critical" | "primary" | "danger";
}) {
  const cls = {
    ghost: "border-white/10 hover:border-white/25",
    critical: "border-critical/40 hover:border-critical/70 bg-critical/5",
    primary: "border-ai/40 hover:border-ai/70 bg-ai/5",
    danger: "border-danger/40 hover:border-danger/70 bg-danger/5",
  }[variant];
  const iconCls = {
    ghost: "text-slate-300",
    critical: "text-critical",
    primary: "text-ai",
    danger: "text-danger",
  }[variant];
  return (
    <button
      onClick={onClick}
      className={cn("group flex items-start gap-3 rounded-xl border bg-bg-800/40 p-4 text-left transition-all hover:-translate-y-0.5", cls)}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5", iconCls)}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
      </div>
    </button>
  );
}

export function Simulation() {
  const state = useAppState();
  const actions = useActions();
  const m = useMetrics();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);

  const runWithAnalysis = (fn: () => void, navigateTo?: string) => {
    setAnalyzing(true);
    setStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      if (i >= ANALYZE_STEPS.length) {
        clearInterval(timer);
        fn();
        setAnalyzing(false);
        if (navigateTo) navigate(navigateTo);
      } else {
        setStep(i);
      }
    }, 360);
  };

  const onlineCam = () =>
    state.cameras.find((c) => c.status === "Online") ?? state.cameras[0];
  const onlineCp = () =>
    state.checkpoints.find((c) => c.status === "Online") ?? state.checkpoints[0];

  return (
    <div>
      {analyzing && <AnalyzeOverlay step={step} />}

      <PageHeader
        title="Disaster Simulation"
        subtitle="Drive the full Horus Rescue AI pipeline live — perfect for the 90-second judge demo."
        actions={
          <button onClick={() => actions.resetDemo()} className="btn-ghost text-sm">
            <RotateCcw className="h-4 w-4" /> Reset Demo
          </button>
        }
      />

      {/* Live counters */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Reports", value: m.totalReports, c: "text-ai" },
          { label: "Critical", value: m.criticalAlerts, c: "text-critical" },
          { label: "IR Events", value: m.irEventsToday, c: "text-danger" },
          { label: "Cameras Detecting", value: m.camerasDetecting, c: "text-ai" },
        ].map((s) => (
          <div key={s.label} className="glass p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className={cn("text-3xl font-extrabold", s.c)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GlassCard>
            <CardHeader title="Simulation Controls" icon={<Zap className="h-4 w-4" />} />
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <ActionTile
                icon={Radio}
                variant="critical"
                title="Run Disaster Simulation"
                desc="Generate 20 reports, fuse signals & rank by risk."
                onClick={() => runWithAnalysis(() => actions.runDisasterSimulation(20))}
              />
              <ActionTile
                icon={Siren}
                variant="danger"
                title="Generate Critical Scenario"
                desc="Spin up one guaranteed AI+IR critical incident."
                onClick={() =>
                  runWithAnalysis(() => {
                    const r = actions.generateCriticalScenario();
                    return r;
                  })
                }
              />
              <ActionTile
                icon={Camera}
                variant="primary"
                title="Simulate Camera Detection"
                desc="A random online camera detects a person."
                onClick={() => actions.setCameraDetection(onlineCam().id, true, pick([1, 2, 3]))}
              />
              <ActionTile
                icon={Cpu}
                variant="critical"
                title="Simulate IR Crossing"
                desc="A random online checkpoint registers movement."
                onClick={() => actions.simulateIrCrossing(onlineCp().id)}
              />
              <ActionTile
                icon={Layers}
                variant="danger"
                title="Simulate AI + IR Critical Alert"
                desc="Detect on a danger-zone camera, then cross its checkpoint."
                onClick={() =>
                  runWithAnalysis(() => actions.generateCriticalScenario(), "/app")
                }
              />
              <ActionTile
                icon={RotateCcw}
                variant="ghost"
                title="Reset Demo Data"
                desc="Restore everything to the seeded baseline."
                onClick={() => actions.resetDemo()}
              />
            </div>
          </GlassCard>

          {/* Judge demo script */}
          <GlassCard className="mt-6">
            <CardHeader title="Judge Demo Script" icon={<Activity className="h-4 w-4" />} />
            <ol className="space-y-2 p-5">
              {[
                "Open the Command Dashboard",
                "Simulate camera detecting a person",
                "Simulate IR checkpoint crossing on the same location",
                "Watch the risk score become Critical",
                "Show the alert + auto-dispatched team",
                "Assign / advance the rescue team on the board",
                "Open Analytics, then file a Mobile Emergency Report",
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai/15 text-xs font-bold text-ai">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{s}</span>
                </li>
              ))}
            </ol>
            <div className="border-t border-white/5 px-5 py-4">
              <button onClick={() => navigate("/app")} className="btn-primary text-sm">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <CardHeader title="Live Event Feed" icon={<Activity className="h-4 w-4" />} />
          <div className="max-h-[640px] overflow-y-auto">
            <Timeline events={state.timeline} limit={30} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
