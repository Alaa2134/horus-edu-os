import { Link } from "react-router-dom";
import {
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Globe2,
  Rocket,
  ListChecks,
  ArrowRight,
  Camera,
  Cpu,
  Layers,
  MessageSquare,
  Navigation,
  Flame,
  Plane,
  Database,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";

function Block({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof AlertTriangle;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </GlassCard>
  );
}

export function About() {
  return (
    <div>
      <PageHeader
        title="About / Hackathon Pitch"
        subtitle="Horus Rescue AI — AI-Powered Emergency Prioritization System."
      />

      {/* Hero */}
      <GlassCard strong className="mb-6 overflow-hidden p-8 shadow-glow">
        <div className="scan-grid absolute inset-0 opacity-30" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ai to-danger text-bg-900">
            <ShieldAlert className="h-8 w-8" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Horus Rescue AI</h2>
            <p className="text-ai">Report · Detect · Prioritize · Rescue</p>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              We fuse AI camera detection with low-cost ESP32 IR checkpoints to
              detect, verify and prioritize people during disasters — turning
              scattered signals into one ranked, actionable command picture.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block icon={AlertTriangle} title="Problem" accent="text-danger">
          Emergency teams receive scattered information and lose precious time
          deciding who needs help first. Camera-only systems flood operators with
          false alarms, and there's rarely physical confirmation that a person is
          truly in danger.
        </Block>

        <Block icon={Lightbulb} title="Solution" accent="text-ok">
          Horus Rescue AI combines AI camera detection and low-cost ESP32 IR
          checkpoints to detect, verify, and prioritize emergency situations into a
          single transparent risk score — with automatic team dispatch.
        </Block>

        <Block icon={Sparkles} title="Innovation" accent="text-ai">
          The system doesn't rely on cameras only. It fuses visual AI detection with
          physical checkpoint confirmation to dramatically reduce false alarms and
          improve emergency awareness — visual + physical = trusted alert.
        </Block>

        <Block icon={Globe2} title="Impact" accent="text-critical">
          Useful for universities, hospitals, malls, factories, stadiums, events and
          smart cities — anywhere people gather and seconds matter.
        </Block>
      </div>

      {/* How fusion works */}
      <GlassCard className="mt-6">
        <CardHeader title="Why fusion wins" icon={<Layers className="h-4 w-4" />} />
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {[
            { icon: Camera, t: "Camera AI alone", d: "Sees people but triggers false alarms from shadows, posters, reflections.", c: "text-ai" },
            { icon: Cpu, t: "IR alone", d: "Confirms movement but can't tell a person from a cart or a draft.", c: "text-critical" },
            { icon: Layers, t: "AI + IR Fusion", d: "Cross-confirmed = high-confidence critical alert worth dispatching.", c: "text-danger" },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-white/10 bg-bg-800/50 p-4">
              <x.icon className={`h-6 w-6 ${x.c}`} />
              <p className="mt-2 font-bold text-white">{x.t}</p>
              <p className="mt-1 text-xs text-slate-400">{x.d}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Future */}
      <GlassCard className="mt-6">
        <CardHeader title="Future Roadmap" icon={<Rocket className="h-4 w-4" />} />
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Camera, t: "Dahua / Hikvision RTSP" },
            { icon: Sparkles, t: "YOLO person detection" },
            { icon: MessageSquare, t: "WhatsApp / SMS alerts" },
            { icon: Navigation, t: "GPS rescue routing" },
            { icon: Flame, t: "IoT smoke / fire sensors" },
            { icon: Plane, t: "Drone integration" },
            { icon: Database, t: "Supabase real-time DB" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3 rounded-xl border border-white/10 bg-bg-800/40 px-4 py-3">
              <x.icon className="h-5 w-5 text-ai" />
              <span className="text-sm font-medium text-slate-200">{x.t}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Judge demo script */}
      <GlassCard className="mt-6" glow="shadow-glow">
        <CardHeader title="Judge Demo Script" icon={<ListChecks className="h-4 w-4" />} />
        <ol className="grid gap-2 p-5 sm:grid-cols-2">
          {[
            "Open the Command Dashboard",
            "Simulate camera detecting a person",
            "Simulate IR checkpoint crossing",
            "Show risk score becoming Critical",
            "Show the alert created + team dispatched",
            "Assign / advance a rescue team",
            "Open Analytics dashboards",
            "File a Mobile Emergency Report",
          ].map((s, i) => (
            <li key={s} className="flex items-start gap-3 rounded-xl border border-white/5 bg-bg-800/40 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai/15 text-xs font-bold text-ai">
                {i + 1}
              </span>
              <span className="text-sm text-slate-300">{s}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 border-t border-white/5 px-5 py-4">
          <Link to="/app/simulation" className="btn-critical text-sm">
            Run Simulation <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/app" className="btn-ghost text-sm">
            Open Command Center
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
