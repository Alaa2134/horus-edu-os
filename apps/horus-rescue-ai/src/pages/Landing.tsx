import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Camera,
  Cpu,
  Layers,
  ArrowRight,
  Siren,
  Activity,
  Radio,
  Building2,
  Hospital,
  Factory,
  Trophy,
  Check,
  Gauge,
  Zap,
} from "lucide-react";
import { RiskMeter } from "@/components/ui/RiskMeter";

function HeroMockup() {
  return (
    <div className="glass-strong relative overflow-hidden p-4 shadow-glow">
      <div className="scan-grid absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-ai">
            <Activity className="h-4 w-4" /> Live Command Feed
          </span>
          <span className="chip border-critical/50 bg-critical/15 text-critical">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-critical" />
            1 Critical
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Reports", value: "24", color: "text-ai" },
            { label: "Critical", value: "3", color: "text-critical" },
            { label: "Teams", value: "5", color: "text-ok" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-bg-800/60 p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                {s.label}
              </p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-4 rounded-xl border border-critical/40 bg-critical/10 p-3">
          <RiskMeter score={95} size={92} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-critical">
              AI + IR Fusion
            </p>
            <p className="text-sm font-semibold text-white">
              Trapped person · North Stadium Tunnel
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Camera confirmed · IR checkpoint confirmed · Team Alpha dispatched
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {[
            { icon: Camera, text: "CAM-03 detected 1 person in danger zone", c: "text-ai" },
            { icon: Cpu, text: "ESP-CHECKPOINT-03 IR crossing confirmed", c: "text-critical" },
            { icon: Layers, text: "Fusion engine → risk escalated to 95", c: "text-danger" },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-bg-800/40 px-3 py-2 text-xs text-slate-300"
            >
              <row.icon className={`h-4 w-4 ${row.c}`} />
              {row.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-ai">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-bg-900/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ai to-danger text-bg-900">
              <ShieldAlert className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="font-extrabold tracking-tight text-white">
              Horus Rescue AI
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#problem" className="hover:text-white">Problem</a>
            <a href="#how" className="hover:text-white">How It Works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#impact" className="hover:text-white">Impact</a>
          </nav>
          <Link to="/app" className="btn-primary px-3 py-2 text-xs sm:text-sm">
            Open Command Center
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="chip border-ai/40 bg-ai/10 text-ai">
            <Zap className="h-3 w-3" /> AI + IoT Emergency Fusion
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            AI-Powered Emergency{" "}
            <span className="bg-gradient-to-r from-ai via-info to-danger bg-clip-text text-transparent">
              Prioritization
            </span>{" "}
            System
          </h1>
          <p className="mt-4 text-lg font-semibold text-slate-300">
            Report. Detect. Prioritize. Rescue.
          </p>
          <p className="mt-3 max-w-xl text-slate-400">
            Horus Rescue AI fuses AI camera detection with low-cost ESP32 IR
            checkpoints to detect, verify, and prioritize people during
            disasters — cutting false alarms and saving critical minutes.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/app" className="btn-primary">
              <Activity className="h-4 w-4" /> Open Command Center
            </Link>
            <Link to="/mobile" className="btn-danger">
              <Siren className="h-4 w-4" /> Start Emergency Report
            </Link>
            <Link to="/app/simulation" className="btn-ghost">
              <Radio className="h-4 w-4" /> Run Disaster Simulation
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-ok" /> Works offline · no hardware required
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-ok" /> Supabase-ready architecture
            </span>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <HeroMockup />
        </div>
      </section>

      {/* Problem / Solution */}
      <Section id="problem" eyebrow="The Problem" title="Emergency teams lose minutes deciding who needs help first">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="glass p-6">
            <h3 className="text-lg font-bold text-danger">Today</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {[
                "Scattered, unverified reports flood operators",
                "Camera-only systems trigger constant false alarms",
                "No physical confirmation that a person is actually there",
                "Manual triage is slow and inconsistent under pressure",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass border-ai/30 p-6 shadow-glow">
            <h3 className="text-lg font-bold text-ai">With Horus Rescue AI</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {[
                "Visual AI + physical IR confirmation = high-confidence alerts",
                "A single risk score ranks every incident automatically",
                "Critical events auto-dispatch the right rescue team",
                "One command center for cameras, checkpoints and reports",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" eyebrow="How It Works" title="Two signals, one decision">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: Camera, title: "Camera AI", text: "Detects people visually and counts them in danger zones.", c: "text-ai" },
            { icon: Cpu, title: "IR Checkpoint", text: "ESP32 + IR sensor confirms real physical movement.", c: "text-critical" },
            { icon: Layers, title: "Fusion Engine", text: "Combines both signals into a 0–100 risk score.", c: "text-danger" },
            { icon: Siren, title: "Rescue", text: "Critical alerts dispatch teams and trigger checkpoint alarms.", c: "text-ok" },
          ].map((step, i) => (
            <div key={step.title} className="glass relative p-5">
              <span className="absolute right-4 top-4 font-mono text-2xl font-bold text-white/10">
                0{i + 1}
              </span>
              <step.icon className={`h-7 w-7 ${step.c}`} />
              <h3 className="mt-3 font-bold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section id="features" eyebrow="Key Features" title="Built for real rescue operations">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Gauge, title: "Risk Scoring Engine", text: "Transparent, explainable scoring with factor breakdown." },
            { icon: Camera, title: "AI Camera Module", text: "Detection boxes, people count and confidence — YOLO-ready." },
            { icon: Cpu, title: "Smart Checkpoints", text: "ESP32 + IR devices with buzzer/LED actuation." },
            { icon: Layers, title: "AI + IR Fusion", text: "Cross-confirmation eliminates false positives." },
            { icon: Activity, title: "Live Command Dashboard", text: "Priority queue, timeline and live device status." },
            { icon: Radio, title: "Disaster Simulation", text: "Generate full scenarios instantly for demos & drills." },
          ].map((f) => (
            <div key={f.title} className="glass p-5 transition-transform hover:-translate-y-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai/10 text-ai">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-bold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Smart checkpoint + camera split */}
      <Section eyebrow="The Hardware Edge" title="Smart Checkpoints & AI Camera Detection">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass p-6">
            <div className="flex items-center gap-3">
              <Cpu className="h-7 w-7 text-critical" />
              <h3 className="text-lg font-bold text-white">Smart Checkpoint System</h3>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              A $5 ESP32 with an IR sensor becomes a physical confirmation node.
              When someone crosses, it reports to the cloud and — if a camera
              already sees a person — instantly escalates to Critical and fires
              its buzzer and LED.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-bg-800/60 p-3 font-mono text-xs text-slate-400">
              IR OUT → GPIO27 · LED → GPIO2 · Buzzer → GPIO26
            </div>
          </div>
          <div className="glass p-6">
            <div className="flex items-center gap-3">
              <Camera className="h-7 w-7 text-ai" />
              <h3 className="text-lg font-bold text-white">AI Camera Detection</h3>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              The camera module detects people, counts them, and flags danger
              zones with live confidence scoring. The architecture is structured
              so real YOLO / OpenCV RTSP streams drop in without UI changes.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="chip border-ai/40 bg-ai/10 text-ai">Person detection</span>
              <span className="chip border-ai/40 bg-ai/10 text-ai">People count</span>
              <span className="chip border-ai/40 bg-ai/10 text-ai">Danger zone</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Impact */}
      <Section id="impact" eyebrow="Impact" title="One platform, everywhere people gather">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: Building2, label: "Universities" },
            { icon: Hospital, label: "Hospitals" },
            { icon: Trophy, label: "Stadiums" },
            { icon: Factory, label: "Factories" },
            { icon: Building2, label: "Malls" },
            { icon: Radio, label: "Smart Cities" },
          ].map((it) => (
            <div key={it.label} className="glass flex flex-col items-center gap-2 p-5 text-center">
              <it.icon className="h-7 w-7 text-ai" />
              <span className="text-sm font-semibold text-white">{it.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Demo flow CTA */}
      <Section eyebrow="Demo Flow" title="See it in 90 seconds">
        <div className="glass-strong overflow-hidden p-6">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Simulate camera detecting a person",
              "Simulate IR checkpoint crossing",
              "Watch risk score escalate to Critical",
              "Assign a rescue team & view analytics",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-xl border border-white/10 bg-bg-800/50 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai text-sm font-bold text-bg-900">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/simulation" className="btn-critical">
              <Radio className="h-4 w-4" /> Run Disaster Simulation
            </Link>
            <Link to="/app" className="btn-ghost">
              Open Command Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      <footer className="border-t border-white/10 px-5 py-10 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-300">Horus Rescue AI</p>
        <p className="mt-1">AI-Powered Emergency Prioritization System · Hackathon Demo Build</p>
      </footer>
    </div>
  );
}
