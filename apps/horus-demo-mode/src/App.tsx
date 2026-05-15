import React, { useState, useEffect, useRef } from 'react';

// ── Inline styles (no build step required for kiosk mode) ──────────────
const COLORS = {
  bg:       '#0a0a0f',
  surface:  '#12121a',
  surface2: '#1a1a27',
  gold:     '#c9a227',
  goldL:    '#f5d060',
  cyan:     '#00d4ff',
  blue:     '#1a73e8',
  text:     '#e8e8f0',
  muted:    '#aaaacc',
  dim:      '#555577',
  success:  '#00e676',
};

const S = {
  app: {
    minHeight: '100vh',
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Inter', -apple-system, sans-serif",
    overflowX: 'hidden' as const,
  },
  header: {
    background: `${COLORS.surface}dd`,
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${COLORS.gold}30`,
    padding: '12px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Cinzel', Georgia, serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldL})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.15em',
  },
  card: {
    background: `${COLORS.surface}`,
    border: `1px solid ${COLORS.gold}25`,
    borderRadius: 12,
    padding: '24px',
    backdropFilter: 'blur(8px)',
  },
  section: {
    padding: '64px 48px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  sectionTitle: {
    fontFamily: "'Cinzel', Georgia, serif",
    fontSize: '2rem',
    fontWeight: 700,
    color: COLORS.gold,
    marginBottom: 8,
    textShadow: `0 0 30px ${COLORS.gold}40`,
  },
  sectionSub: {
    color: COLORS.muted,
    fontSize: '0.95rem',
    marginBottom: 40,
    lineHeight: 1.6,
  },
};

// ── Components ─────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div style={{
      height: 1, width: '100%',
      background: `linear-gradient(90deg, transparent, ${COLORS.gold}60, transparent)`,
      margin: '0',
    }} />
  );
}

function StatBar({ value, max = 100, color = COLORS.gold }: { value: number; max?: number; color?: string }) {
  return (
    <div style={{ height: 6, background: COLORS.surface2, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${(value / max) * 100}%`,
        background: color, borderRadius: 3,
        transition: 'width 0.8s ease',
        boxShadow: `0 0 8px ${color}60`,
      }} />
    </div>
  );
}

function Badge({ text, color = COLORS.gold }: { text: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      border: `1px solid ${color}50`,
      borderRadius: 20,
      fontSize: '0.7rem',
      color,
      background: `${color}12`,
      fontWeight: 600,
      letterSpacing: '0.05em',
      margin: '3px 3px',
    }}>{text}</span>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────
function HeroSection({ lang }: { lang: 'en' | 'ar' }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const chars = "INTELLIGENCE AWAKENED";
  const revealed = Math.min(tick, chars.length);

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
      background: `radial-gradient(ellipse at 50% 40%, ${COLORS.surface} 0%, ${COLORS.bg} 70%)`,
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${COLORS.gold}08 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gold}08 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Eye of Horus symbol */}
        <div style={{
          fontSize: '4rem', marginBottom: 24,
          filter: `drop-shadow(0 0 20px ${COLORS.gold}60)`,
        }}>𓂀</div>

        <h1 style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 900,
          background: `linear-gradient(135deg, ${COLORS.goldL} 0%, ${COLORS.gold} 40%, ${COLORS.cyan} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.15em',
          marginBottom: 8,
          lineHeight: 1.1,
        }}>
          HORUS OS
        </h1>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '1.1rem',
          color: COLORS.cyan,
          letterSpacing: '0.3em',
          marginBottom: 6,
          minHeight: '1.5em',
        }}>
          {chars.slice(0, revealed)}
          {revealed < chars.length && <span style={{ opacity: tick % 2 === 0 ? 1 : 0 }}>|</span>}
        </p>

        <p style={{
          fontSize: '1.1rem',
          color: COLORS.gold,
          marginBottom: 32,
          fontFamily: "'Noto Naskh Arabic', Arial, sans-serif",
          direction: 'rtl',
        }}>
          نظام حورس — ذكاء مدمج للمستقبل
        </p>

        <p style={{ color: COLORS.muted, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7, fontSize: '0.95rem' }}>
          A custom Linux-based operating system designed for embedded laptops, AI education,
          hardware control, and student innovation. Built from the ground up by
          <strong style={{ color: COLORS.gold }}> Alaa Saber</strong>.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['University Competition', 'Embedded Intelligence', 'Open Source', 'Arabic + English'].map(t => (
            <Badge key={t} text={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Why HORUS Section ──────────────────────────────────────────────────
function WhySection() {
  const problems = [
    { icon: '⚡', problem: 'Generic Linux distros are not optimized for embedded education', solution: 'HORUS ships with all embedded tools pre-configured' },
    { icon: '🧠', problem: 'Students lack intelligent in-system guidance', solution: 'HORUS AI Assistant provides context-aware help offline' },
    { icon: '🎨', problem: 'No unified identity across student OS projects', solution: 'HORUS delivers a professional branded experience end-to-end' },
    { icon: '🔬', problem: 'Hardware monitoring requires separate fragmented tools', solution: 'HORUS Control Center unifies all metrics in one dashboard' },
  ];

  return (
    <div style={{ ...S.section, borderTop: `1px solid ${COLORS.surface2}` }}>
      <p style={{ color: COLORS.cyan, fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: 8 }}>THE PROBLEM & SOLUTION</p>
      <h2 style={S.sectionTitle}>Why HORUS OS?</h2>
      <p style={S.sectionSub}>Every design decision in HORUS OS exists to solve a real problem faced by embedded systems students and engineers.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {problems.map(({ icon, problem, solution }) => (
          <div key={problem} style={{ ...S.card, borderLeft: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{icon}</div>
            <p style={{ color: COLORS.error || '#f44336', fontSize: '0.82rem', marginBottom: 10, lineHeight: 1.5 }}>
              ✗ {problem}
            </p>
            <p style={{ color: COLORS.success, fontSize: '0.85rem', lineHeight: 1.5 }}>
              ✓ {solution}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Features Section ───────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { icon: '🚀', title: 'Custom Boot Experience', desc: 'Animated Plymouth splash with HORUS logo, custom GRUB2 theme, sub-15 second boot time.' },
    { icon: '📊', title: 'Control Center', desc: 'Real-time CPU, RAM, disk, network, temperature monitoring. Performance modes, export reports.' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Local AI (Ollama/Mistral) with OS awareness. Student, Engineer, Debug, and Demo modes.' },
    { icon: '🔐', title: 'Security Center', desc: 'UFW firewall, SSH config, LUKS encryption status, privacy dashboard, log viewer.' },
    { icon: '🔧', title: 'Embedded Toolchain', desc: 'Python 3.11, Arduino CLI, i2c-tools, GPIO, minicom — all pre-installed and configured.' },
    { icon: '🌐', title: 'Arabic + English', desc: 'Full RTL support, Arabic fonts (Noto Naskh), bilingual UI across all HORUS apps.' },
    { icon: '💎', title: 'Premium Identity', desc: 'Cyber-Egyptian design language. Horus Gold + Electric Blue. Glassmorphism throughout.' },
    { icon: '📺', title: 'Demo Mode', desc: 'This very screen. A full kiosk presentation app built for live competition demos.' },
  ];

  return (
    <div style={{ ...S.section, background: `${COLORS.surface}60` }}>
      <p style={{ color: COLORS.cyan, fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: 8 }}>CAPABILITIES</p>
      <h2 style={S.sectionTitle}>What HORUS OS Delivers</h2>
      <p style={S.sectionSub}>Every feature is real, installed, and demonstrated live on this machine.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {features.map(({ icon, title, desc }) => (
          <div key={title} style={{
            ...S.card,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{icon}</div>
            <h3 style={{ color: COLORS.gold, fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>{title}</h3>
            <p style={{ color: COLORS.muted, fontSize: '0.82rem', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Live Stats Section ─────────────────────────────────────────────────
function LiveStatsSection() {
  interface Stats { cpu?: number; mem?: number; temp?: number; uptime?: string; disk?: number; }
  const [stats, setStats] = useState<Stats>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cpuR, memR, tempR, sysR, diskR] = await Promise.allSettled([
          fetch('http://127.0.0.1:8420/api/cpu'),
          fetch('http://127.0.0.1:8420/api/memory'),
          fetch('http://127.0.0.1:8420/api/temperatures'),
          fetch('http://127.0.0.1:8420/api/system'),
          fetch('http://127.0.0.1:8420/api/disks'),
        ]);
        const cpu = cpuR.status === 'fulfilled' ? (await cpuR.value.json()).percent : null;
        const mem = memR.status === 'fulfilled' ? (await memR.value.json()).percent : null;
        const tempData = tempR.status === 'fulfilled' ? await tempR.value.json() : [];
        const temp = tempData.length ? Math.max(...tempData.map((t: any) => t.current)) : null;
        const uptime = sysR.status === 'fulfilled' ? (await sysR.value.json()).uptime : null;
        const diskData = diskR.status === 'fulfilled' ? await diskR.value.json() : [];
        const disk = diskData.length ? diskData[0]?.percent : null;
        setStats({ cpu, mem, temp, uptime, disk });
        setConnected(true);
      } catch {
        setConnected(false);
      }
    };
    fetchStats();
    const id = setInterval(fetchStats, 3000);
    return () => clearInterval(id);
  }, []);

  const StatItem = ({ label, value, bar, color = COLORS.gold }: {
    label: string; value: string; bar?: number; color?: string;
  }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: COLORS.muted, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{value}</span>
      </div>
      {bar !== undefined && <StatBar value={bar} color={color} />}
    </div>
  );

  return (
    <div style={S.section}>
      <p style={{ color: COLORS.cyan, fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: 8 }}>LIVE DATA</p>
      <h2 style={S.sectionTitle}>Real-Time System Stats</h2>
      <p style={S.sectionSub}>
        {connected
          ? '✓ Live data from HORUS Control Center API running on this machine'
          : '⚠ Control Center API not detected — start it with: horus-control'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ color: COLORS.gold, marginBottom: 20, fontSize: '0.8rem', letterSpacing: '0.15em' }}>PERFORMANCE</h3>
          <StatItem label="CPU Usage" value={stats.cpu != null ? `${stats.cpu.toFixed(1)}%` : '—'} bar={stats.cpu} />
          <StatItem label="Memory" value={stats.mem != null ? `${stats.mem.toFixed(1)}%` : '—'} bar={stats.mem} color={COLORS.cyan} />
          <StatItem label="Disk (/)" value={stats.disk != null ? `${stats.disk.toFixed(0)}%` : '—'} bar={stats.disk} color={COLORS.blue} />
        </div>

        <div style={S.card}>
          <h3 style={{ color: COLORS.gold, marginBottom: 20, fontSize: '0.8rem', letterSpacing: '0.15em' }}>SYSTEM STATUS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Temperature', value: stats.temp != null ? `${stats.temp.toFixed(0)}°C` : 'N/A' },
              { label: 'Uptime', value: stats.uptime ?? '—' },
              { label: 'API Status', value: connected ? 'Online' : 'Offline' },
              { label: 'OS Version', value: '1.0.0' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: COLORS.surface2, borderRadius: 8, padding: 12 }}>
                <p style={{ color: COLORS.dim, fontSize: '0.68rem', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
                <p style={{ color: COLORS.gold, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.9rem' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Use Cases Section ──────────────────────────────────────────────────
function UseCasesSection() {
  const cases = [
    { icon: '🎓', title: 'Education', items: ['Learn Linux from a clean environment', 'Python programming with pre-installed tools', 'Embedded systems curriculum ready', 'AI-assisted learning with HORUS AI'] },
    { icon: '🤖', title: 'Robotics', items: ['GPIO control with libgpiod', 'I2C/SPI sensor integration', 'Arduino via USB and Arduino CLI', 'Serial monitor built-in'] },
    { icon: '🔬', title: 'Embedded Research', items: ['Lightweight x86 or ARM target', 'Low-level hardware access', 'Cross-compilation toolchain', 'Real-time monitoring'] },
    { icon: '💼', title: 'Competition', items: ['Fully branded professional demo', 'Live system statistics', 'AI-powered Q&A', 'Bilingual Arabic/English support'] },
  ];

  return (
    <div style={{ ...S.section, background: `${COLORS.surface}40` }}>
      <p style={{ color: COLORS.cyan, fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: 8 }}>USE CASES</p>
      <h2 style={S.sectionTitle}>Who Is HORUS OS For?</h2>
      <p style={S.sectionSub}>Built for anyone working at the intersection of software, hardware, and intelligence.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {cases.map(({ icon, title, items }) => (
          <div key={title} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.5rem' }}>{icon}</span>
              <h3 style={{ color: COLORS.gold, fontWeight: 600 }}>{title}</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map(item => (
                <li key={item} style={{ color: COLORS.muted, fontSize: '0.82rem', padding: '4px 0', display: 'flex', gap: 8 }}>
                  <span style={{ color: COLORS.gold }}>›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Roadmap Section ────────────────────────────────────────────────────
function RoadmapSection() {
  const milestones = [
    { version: 'v1.0', status: 'done', title: 'Foundation', items: ['Custom boot (Plymouth + GRUB)', 'XFCE4 dark themed desktop', 'Control Center + Demo Mode', 'Security Center + AI Assistant'] },
    { version: 'v1.1', status: 'next', title: 'Intelligence', items: ['Local Ollama AI fully integrated', 'HORUS AI with hardware Q&A', 'Code assistant mode', 'Sensor visualization'] },
    { version: 'v1.2', status: 'planned', title: 'Shell', items: ['Custom Flutter desktop shell', 'Replace XFCE4 entirely', 'Animated workspace transitions', 'Mobile-style launcher'] },
    { version: 'v2.0', status: 'planned', title: 'Platform', items: ['Custom kernel configuration', 'HORUS APT repository', 'OEM first-boot wizard', 'Remote management console'] },
  ];

  const statusColor: Record<string, string> = { done: COLORS.success, next: COLORS.gold, planned: COLORS.dim };

  return (
    <div style={S.section}>
      <p style={{ color: COLORS.cyan, fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: 8 }}>FUTURE</p>
      <h2 style={S.sectionTitle}>Roadmap</h2>
      <p style={S.sectionSub}>HORUS OS is a living project. Here's where it's going.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {milestones.map(({ version, status, title, items }) => (
          <div key={version} style={{
            ...S.card,
            borderColor: `${statusColor[status]}40`,
            borderLeft: `3px solid ${statusColor[status]}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: statusColor[status], fontWeight: 700 }}>{version}</span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
                color: statusColor[status], background: `${statusColor[status]}15`,
                padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase',
              }}>{status}</span>
            </div>
            <h3 style={{ color: COLORS.text, marginBottom: 10, fontSize: '0.9rem' }}>{title}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {items.map(i => (
                <li key={i} style={{ color: COLORS.muted, fontSize: '0.78rem', padding: '3px 0', display: 'flex', gap: 6 }}>
                  <span style={{ color: statusColor[status] }}>·</span>{i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Credits Section ────────────────────────────────────────────────────
function CreditsSection() {
  return (
    <div style={{ ...S.section, textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16, filter: `drop-shadow(0 0 20px ${COLORS.gold}60)` }}>𓂀</div>
      <h2 style={{ ...S.sectionTitle, fontSize: '1.5rem' }}>Created By</h2>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>Alaa Saber</p>
      <p style={{ color: COLORS.cyan, fontSize: '0.9rem', marginBottom: 24 }}>University Competition Project — Embedded Systems & Student Innovation</p>
      <p style={{ color: COLORS.muted, fontSize: '0.85rem', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
        Built on Ubuntu 22.04 LTS · XFCE4 · Python · React · FastAPI · Ollama
        <br />Plymouth · GRUB2 · systemd · NetworkManager
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Badge text="HORUS OS v1.0.0" color={COLORS.gold} />
        <Badge text="Open Source" color={COLORS.cyan} />
        <Badge text="MIT License" color={COLORS.blue} />
        <Badge text="2026" color={COLORS.dim} />
      </div>
      <p style={{
        marginTop: 48,
        fontFamily: 'Cinzel, serif',
        fontSize: '1.1rem',
        color: COLORS.gold,
        letterSpacing: '0.2em',
        textShadow: `0 0 20px ${COLORS.gold}50`,
      }}>
        INTELLIGENCE AWAKENED
      </p>
      <p style={{ color: COLORS.gold, fontFamily: 'Noto Naskh Arabic, Arial', direction: 'rtl', marginTop: 8 }}>
        ذكاء مدمج للمستقبل
      </p>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  return (
    <div style={S.app}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={S.logo}>HORUS OS</span>
          <span style={{ color: COLORS.cyan, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em' }}>
            DEMO MODE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: COLORS.dim, fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
            v1.0.0 · Alaa Saber
          </span>
          <button
            onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
            style={{
              background: 'transparent',
              border: `1px solid ${COLORS.gold}40`,
              color: COLORS.gold,
              padding: '4px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontFamily: 'inherit',
            }}
          >
            {lang === 'en' ? 'عربي' : 'English'}
          </button>
        </div>
      </header>

      {/* Sections */}
      <HeroSection lang={lang} />
      <GoldDivider />
      <WhySection />
      <GoldDivider />
      <FeaturesSection />
      <GoldDivider />
      <LiveStatsSection />
      <GoldDivider />
      <UseCasesSection />
      <GoldDivider />
      <RoadmapSection />
      <GoldDivider />
      <CreditsSection />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        borderTop: `1px solid ${COLORS.surface2}`,
        color: COLORS.dim,
        fontSize: '0.75rem',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        HORUS OS v1.0.0 · Intelligence Awakened · Created by Alaa Saber · 2026
      </footer>
    </div>
  );
}
