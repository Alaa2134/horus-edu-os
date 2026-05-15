import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Cpu, MemoryStick, HardDrive, Wifi, Thermometer, Battery,
  Activity, Shield, Info, Settings, Download, Zap, RefreshCw,
  Server, Clock, Globe, ChevronRight
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { clsx } from 'clsx';

const API = 'http://127.0.0.1:8420/api';

// ── Types ──────────────────────────────────────────────────────────────
interface SystemInfo { os_pretty:string; kernel:string; hostname:string; uptime:string; arch:string; creator:string; horus_version:string; }
interface CPUInfo    { percent:number; per_core:number[]; count_physical:number; count_logical:number; freq_current:number; freq_max:number; model:string; load_avg_1:number; load_avg_5:number; load_avg_15:number; }
interface MemInfo    { percent:number; used_human:string; total_human:string; available_human:string; swap_percent:number; swap_used:number; swap_total:number; }
interface DiskPart   { device:string; mountpoint:string; fstype:string; percent:number; used_human:string; total_human:string; free_human:string; }
interface NetIface   { name:string; ip_address:string; bytes_sent_human:string; bytes_recv_human:string; is_up:boolean; speed_mbps:number; }
interface TempReading{ sensor:string; label:string; current:number; high?:number; critical?:number; }
interface BattInfo   { percent:number; power_plugged:boolean; time_left_human?:string; status:string; }
interface ProcInfo   { pid:number; name:string; cpu_percent:number; memory_percent:number; memory_rss_human:string; status:string; username:string; }

type NavPage = 'dashboard' | 'cpu' | 'memory' | 'storage' | 'network' | 'processes' | 'hardware' | 'security';

// ── Helpers ────────────────────────────────────────────────────────────
function useInterval(fn: () => void, ms: number) {
  useEffect(() => {
    fn();
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  }, [fn, ms]);
}

function colorForPercent(p: number): string {
  if (p < 60) return '#00e676';
  if (p < 85) return '#ff9800';
  return '#f44336';
}

function ProgressBar({ value, color }: { value: number; color?: string }) {
  const c = color || colorForPercent(value);
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${Math.min(100, value)}%`, background: c }}
      />
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, sub, children, className,
}: {
  icon?: React.ElementType; label: string; value?: string; sub?: string;
  children?: React.ReactNode; className?: string;
}) {
  return (
    <div className={clsx('glass-card p-5 flex flex-col gap-3 animate-fade-in', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-horus-gold opacity-70" />}
        <span className="metric-label">{label}</span>
      </div>
      {value && <div className="metric-value">{value}</div>}
      {sub && <div className="text-horus-muted text-xs font-mono">{sub}</div>}
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono">
      <p className="text-horus-muted mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value?.toFixed?.(1) ?? p.value}%</p>
      ))}
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard' as NavPage, icon: Activity,     label: 'Dashboard'  },
  { id: 'cpu'       as NavPage, icon: Cpu,          label: 'CPU'        },
  { id: 'memory'    as NavPage, icon: MemoryStick,  label: 'Memory'     },
  { id: 'storage'   as NavPage, icon: HardDrive,    label: 'Storage'    },
  { id: 'network'   as NavPage, icon: Wifi,         label: 'Network'    },
  { id: 'processes' as NavPage, icon: Server,       label: 'Processes'  },
  { id: 'hardware'  as NavPage, icon: Settings,     label: 'Hardware'   },
  { id: 'security'  as NavPage, icon: Shield,       label: 'Security'   },
];

function Sidebar({ page, setPage, sys }: { page: NavPage; setPage: (p: NavPage) => void; sys?: SystemInfo }) {
  return (
    <aside className="flex flex-col w-56 min-h-screen bg-horus-surface border-r border-horus-surface2 py-5 px-3">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 px-2">
        <h1 className="horus-title text-xl font-bold tracking-widest">HORUS OS</h1>
        <p className="text-horus-cyan text-[9px] font-mono tracking-[0.25em] mt-1">CONTROL CENTER</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setPage(id)}
            className={clsx('nav-item', page === id && 'active')}>
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* System quick info */}
      {sys && (
        <div className="mt-6 px-2 py-3 rounded-lg bg-horus-surface2 border border-horus-surface3">
          <p className="text-horus-gold text-[10px] font-mono font-bold mb-2">SYSTEM</p>
          <p className="text-horus-muted text-[9px] font-mono leading-5">
            <span className="text-horus-text">{sys.hostname}</span><br/>
            Kernel: {sys.kernel.split('-')[0]}<br/>
            Up: {sys.uptime}<br/>
            {sys.arch}
          </p>
        </div>
      )}

      {/* Creator tag */}
      <p className="text-horus-dim text-[9px] font-mono text-center mt-4 leading-4">
        HORUS OS v{sys?.horus_version ?? '1.0'}<br/>
        by Alaa Saber
      </p>
    </aside>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────
function DashboardPage({ cpu, mem, disks, temps, bat, history }: {
  cpu?: CPUInfo; mem?: MemInfo; disks: DiskPart[]; temps: TempReading[];
  bat?: BattInfo | null; history: { time: string; cpu: number; mem: number }[];
}) {
  const maxTemp = temps.length ? Math.max(...temps.map(t => t.current)) : null;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-horus-text text-lg font-semibold">Dashboard</h2>
        <p className="text-horus-dim text-xs font-mono">{new Date().toLocaleTimeString()}</p>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={Cpu} label="CPU Usage" value={`${cpu?.percent?.toFixed(1) ?? '—'}%`}
          sub={cpu?.model?.split(' ').slice(-3).join(' ')}>
          {cpu && <ProgressBar value={cpu.percent} />}
        </MetricCard>

        <MetricCard icon={MemoryStick} label="Memory" value={`${mem?.percent?.toFixed(1) ?? '—'}%`}
          sub={`${mem?.used_human ?? '—'} / ${mem?.total_human ?? '—'}`}>
          {mem && <ProgressBar value={mem.percent} />}
        </MetricCard>

        <MetricCard icon={Thermometer} label="Temperature"
          value={maxTemp != null ? `${maxTemp.toFixed(1)}°C` : 'N/A'}
          sub={maxTemp != null ? (maxTemp > 80 ? '⚠ HOT' : maxTemp > 60 ? 'WARM' : 'COOL') : 'No sensor'}>
          {maxTemp != null && (
            <ProgressBar value={(maxTemp / 100) * 100}
              color={maxTemp > 80 ? '#f44336' : maxTemp > 60 ? '#ff9800' : '#00e676'} />
          )}
        </MetricCard>

        <MetricCard icon={Battery} label="Battery"
          value={bat ? `${bat.percent.toFixed(0)}%` : 'AC Power'}
          sub={bat ? `${bat.status}${bat.time_left_human ? ' · ' + bat.time_left_human : ''}` : 'Plugged in'}>
          {bat && <ProgressBar value={bat.percent} color={bat.percent < 20 ? '#f44336' : '#00e676'} />}
        </MetricCard>
      </div>

      {/* Live chart */}
      <div className="glass-card p-5">
        <p className="metric-label mb-4 flex items-center gap-2">
          <Activity size={12} /> Live Performance (last 30s)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a227" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c9a227" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a1a27" />
            <XAxis dataKey="time" tick={{ fill: '#555577', fontSize: 9 }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#555577', fontSize: 9 }} tickLine={false} width={25} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cpu" name="CPU" stroke="#c9a227" fill="url(#cpuGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="mem" name="MEM" stroke="#00d4ff" fill="url(#memGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-2">
          <span className="text-[10px] font-mono" style={{ color: '#c9a227' }}>■ CPU</span>
          <span className="text-[10px] font-mono" style={{ color: '#00d4ff' }}>■ Memory</span>
        </div>
      </div>

      {/* Disks summary */}
      <div className="glass-card p-5">
        <p className="metric-label mb-4 flex items-center gap-2"><HardDrive size={12} /> Storage</p>
        <div className="space-y-3">
          {disks.slice(0, 4).map(d => (
            <div key={d.mountpoint}>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-horus-muted">{d.mountpoint}</span>
                <span className="text-horus-text">{d.used_human} / {d.total_human}</span>
                <span style={{ color: colorForPercent(d.percent) }}>{d.percent.toFixed(0)}%</span>
              </div>
              <ProgressBar value={d.percent} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CPU Page ───────────────────────────────────────────────────────────
function CPUPage({ cpu, history }: { cpu?: CPUInfo; history: { time: string; cpu: number }[] }) {
  const [perfMode, setPerfMode] = useState<string>('');

  const setMode = async (mode: string) => {
    try {
      await axios.post(`${API}/performance-mode/${mode}`);
      setPerfMode(mode);
    } catch { setPerfMode(mode + ' (failed)'); }
  };

  if (!cpu) return <div className="p-6 text-horus-muted font-mono">Loading CPU data...</div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-horus-text text-lg font-semibold">CPU</h2>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={Cpu} label="Usage" value={`${cpu.percent.toFixed(1)}%`}>
          <ProgressBar value={cpu.percent} />
        </MetricCard>
        <MetricCard icon={Zap} label="Frequency" value={`${(cpu.freq_current/1000).toFixed(2)} GHz`}
          sub={`Max: ${(cpu.freq_max/1000).toFixed(2)} GHz`} />
        <MetricCard icon={Activity} label="Load Avg"
          value={cpu.load_avg_1.toFixed(2)}
          sub={`5m: ${cpu.load_avg_5.toFixed(2)}  15m: ${cpu.load_avg_15.toFixed(2)}`} />
        <MetricCard icon={Server} label="Cores"
          value={`${cpu.count_physical}P`}
          sub={`${cpu.count_logical} logical threads`} />
      </div>

      <div className="glass-card p-5">
        <p className="metric-label mb-1 text-xs">{cpu.model}</p>
        <p className="text-horus-dim text-[10px] font-mono mb-4">Per-core usage</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {cpu.per_core.map((p, i) => (
            <div key={i} className="bg-horus-surface2 rounded-lg p-2 text-center">
              <p className="text-horus-muted text-[9px] mb-1 font-mono">Core {i}</p>
              <p className="font-mono text-sm font-bold" style={{ color: colorForPercent(p) }}>
                {p.toFixed(0)}%
              </p>
              <ProgressBar value={p} color={colorForPercent(p)} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <p className="metric-label mb-4 flex items-center gap-2"><Activity size={12} /> CPU History</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a1a27" />
            <XAxis dataKey="time" tick={{ fill: '#555577', fontSize: 9 }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#555577', fontSize: 9 }} tickLine={false} width={25} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="cpu" name="CPU" stroke="#c9a227" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-5">
        <p className="metric-label mb-4">Performance Mode</p>
        <div className="flex gap-3">
          {['performance', 'balanced', 'powersave'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={clsx(perfMode === m ? 'btn-gold' : 'btn-outline', 'capitalize')}>
              {m}
            </button>
          ))}
        </div>
        {perfMode && <p className="text-horus-cyan text-xs font-mono mt-3">Mode: {perfMode}</p>}
      </div>
    </div>
  );
}

// ── Processes Page ─────────────────────────────────────────────────────
function ProcessesPage({ procs }: { procs: ProcInfo[] }) {
  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-horus-text text-lg font-semibold mb-4">Processes</h2>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-horus-surface3">
              <th className="text-left p-3 text-horus-dim">PID</th>
              <th className="text-left p-3 text-horus-dim">Name</th>
              <th className="text-right p-3 text-horus-dim">CPU%</th>
              <th className="text-right p-3 text-horus-dim">MEM%</th>
              <th className="text-right p-3 text-horus-dim">RSS</th>
              <th className="text-left p-3 text-horus-dim">User</th>
              <th className="text-left p-3 text-horus-dim">Status</th>
            </tr>
          </thead>
          <tbody>
            {procs.map((p, i) => (
              <tr key={p.pid} className={clsx('border-b border-horus-surface2 hover:bg-horus-surface2 transition-colors',
                i % 2 === 0 ? '' : 'bg-black/10')}>
                <td className="p-3 text-horus-dim">{p.pid}</td>
                <td className="p-3 text-horus-text max-w-32 truncate">{p.name}</td>
                <td className="p-3 text-right" style={{ color: colorForPercent(p.cpu_percent * 5) }}>
                  {p.cpu_percent.toFixed(1)}
                </td>
                <td className="p-3 text-right text-horus-muted">{p.memory_percent.toFixed(2)}</td>
                <td className="p-3 text-right text-horus-dim">{p.memory_rss_human}</td>
                <td className="p-3 text-horus-muted">{p.username}</td>
                <td className="p-3">
                  <span className={clsx('px-2 py-0.5 rounded text-[9px]',
                    p.status === 'running' ? 'bg-green-900/30 text-green-400' : 'bg-horus-surface3 text-horus-dim')}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<NavPage>('dashboard');
  const [sys, setSys] = useState<SystemInfo>();
  const [cpu, setCpu] = useState<CPUInfo>();
  const [mem, setMem] = useState<MemInfo>();
  const [disks, setDisks] = useState<DiskPart[]>([]);
  const [nets, setNets] = useState<NetIface[]>([]);
  const [temps, setTemps] = useState<TempReading[]>([]);
  const [bat, setBat] = useState<BattInfo | null>(null);
  const [procs, setProcs] = useState<ProcInfo[]>([]);
  const [history, setHistory] = useState<{ time: string; cpu: number; mem: number }[]>([]);
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [sysR, cpuR, memR, diskR, netR, tempR, batR] = await Promise.allSettled([
        axios.get(`${API}/system`),
        axios.get(`${API}/cpu`),
        axios.get(`${API}/memory`),
        axios.get(`${API}/disks`),
        axios.get(`${API}/network`),
        axios.get(`${API}/temperatures`),
        axios.get(`${API}/battery`),
      ]);

      if (sysR.status === 'fulfilled')  setSys(sysR.value.data);
      if (cpuR.status === 'fulfilled')  setCpu(cpuR.value.data);
      if (memR.status === 'fulfilled')  setMem(memR.value.data);
      if (diskR.status === 'fulfilled') setDisks(diskR.value.data);
      if (netR.status === 'fulfilled')  setNets(netR.value.data);
      if (tempR.status === 'fulfilled') setTemps(tempR.value.data);
      if (batR.status === 'fulfilled')  setBat(batR.value.data);

      const now = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastUpdate(now);

      const cpuVal = cpuR.status === 'fulfilled' ? cpuR.value.data.percent : 0;
      const memVal = memR.status === 'fulfilled' ? memR.value.data.percent : 0;
      setHistory(prev => [...prev.slice(-29), { time: now.slice(0,5), cpu: cpuVal, mem: memVal }]);
    } catch { /* API not yet running */ }
  }, []);

  const fetchProcs = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/processes?limit=30`);
      setProcs(r.data);
    } catch {}
  }, []);

  useInterval(fetchAll, 2000);
  useInterval(fetchProcs, 5000);

  const exportReport = async () => {
    try {
      const r = await axios.get(`${API}/full-report`);
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horus-report-${Date.now()}.json`;
      a.click();
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-gradient-bg">
      <Sidebar page={page} setPage={setPage} sys={sys} />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-horus-surface2 bg-horus-surface/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-horus-dim text-xs font-mono">
            <span className="text-horus-gold font-bold">HORUS OS</span>
            <ChevronRight size={10} />
            <span className="capitalize">{page}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-horus-dim text-[10px] font-mono">Updated: {lastUpdate}</span>
            <button onClick={exportReport} className="btn-outline flex items-center gap-1.5 text-[10px]">
              <Download size={11} /> Export
            </button>
          </div>
        </header>

        {/* Page content */}
        {page === 'dashboard'  && <DashboardPage cpu={cpu} mem={mem} disks={disks} temps={temps} bat={bat} history={history} />}
        {page === 'cpu'        && <CPUPage cpu={cpu} history={history} />}
        {page === 'processes'  && <ProcessesPage procs={procs} />}
        {page === 'memory'     && (
          <div className="p-6 space-y-4 animate-fade-in">
            <h2 className="text-horus-text text-lg font-semibold">Memory</h2>
            {mem ? (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard icon={MemoryStick} label="Used" value={`${mem.percent.toFixed(1)}%`}
                  sub={`${mem.used_human} of ${mem.total_human}`}>
                  <ProgressBar value={mem.percent} />
                </MetricCard>
                <MetricCard icon={Activity} label="Available" value={mem.available_human} sub="Free" />
                <MetricCard icon={HardDrive} label="Swap Used" value={`${mem.swap_percent.toFixed(1)}%`}>
                  <ProgressBar value={mem.swap_percent} />
                </MetricCard>
              </div>
            ) : <p className="text-horus-muted font-mono">Loading...</p>}
          </div>
        )}
        {page === 'storage' && (
          <div className="p-6 space-y-4 animate-fade-in">
            <h2 className="text-horus-text text-lg font-semibold">Storage</h2>
            <div className="space-y-3">
              {disks.map(d => (
                <div key={d.mountpoint} className="glass-card p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-horus-text text-sm font-mono">{d.device}</p>
                      <p className="text-horus-dim text-xs">{d.mountpoint} · {d.fstype}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-horus-text font-mono">{d.used_human} / {d.total_human}</p>
                      <p className="text-xs font-mono" style={{ color: colorForPercent(d.percent) }}>{d.percent.toFixed(1)}%</p>
                    </div>
                  </div>
                  <ProgressBar value={d.percent} />
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'network' && (
          <div className="p-6 space-y-4 animate-fade-in">
            <h2 className="text-horus-text text-lg font-semibold">Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nets.map(n => (
                <div key={n.name} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={clsx('status-dot', n.is_up ? 'online' : 'offline')} />
                    <p className="text-horus-text font-mono font-bold">{n.name}</p>
                    <span className="text-horus-dim text-xs">{n.speed_mbps ? `${n.speed_mbps} Mbps` : ''}</span>
                  </div>
                  <p className="text-horus-muted text-xs font-mono mb-2">{n.ip_address}</p>
                  <div className="flex gap-6 text-xs font-mono">
                    <div><p className="text-horus-dim">↑ Sent</p><p className="text-horus-text">{n.bytes_sent_human}</p></div>
                    <div><p className="text-horus-dim">↓ Recv</p><p className="text-horus-text">{n.bytes_recv_human}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'hardware' && (
          <div className="p-6 animate-fade-in">
            <h2 className="text-horus-text text-lg font-semibold mb-4">Hardware Info</h2>
            <div className="glass-card p-5 space-y-3 font-mono text-xs">
              <p><span className="text-horus-gold">CPU:</span> <span className="text-horus-text">{cpu?.model}</span></p>
              <p><span className="text-horus-gold">Cores:</span> <span className="text-horus-text">{cpu?.count_physical} physical / {cpu?.count_logical} logical</span></p>
              <p><span className="text-horus-gold">RAM:</span> <span className="text-horus-text">{mem?.total_human}</span></p>
              <p><span className="text-horus-gold">OS:</span> <span className="text-horus-text">{sys?.os_pretty}</span></p>
              <p><span className="text-horus-gold">Kernel:</span> <span className="text-horus-text">{sys?.kernel}</span></p>
              <p><span className="text-horus-gold">Host:</span> <span className="text-horus-text">{sys?.hostname}</span></p>
              <p><span className="text-horus-gold">Arch:</span> <span className="text-horus-text">{sys?.arch}</span></p>
              {temps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-horus-surface3">
                  <p className="text-horus-gold mb-2">Temperatures:</p>
                  {temps.map((t, i) => (
                    <p key={i} className="text-horus-muted">
                      {t.label}: <span className="text-horus-text">{t.current.toFixed(1)}°C</span>
                      {t.high && <span className="text-horus-dim"> (high: {t.high}°C)</span>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {page === 'security' && (
          <div className="p-6 animate-fade-in">
            <h2 className="text-horus-text text-lg font-semibold mb-4">Security Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Firewall (UFW)', hint: 'Check Security Center app for full config' },
                { label: 'SSH Service', hint: 'Configured in /etc/ssh/sshd_config.d/horus.conf' },
                { label: 'Disk Encryption', hint: 'Set up during installation with LUKS' },
                { label: 'Automatic Updates', hint: 'Enable with unattended-upgrades' },
              ].map(({ label, hint }) => (
                <div key={label} className="glass-card p-4 flex items-center gap-3">
                  <Shield size={18} className="text-horus-gold opacity-70" />
                  <div>
                    <p className="text-horus-text text-sm">{label}</p>
                    <p className="text-horus-dim text-xs">{hint}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-horus-muted text-xs font-mono mt-6">
              Open <span className="text-horus-cyan">horus-security</span> in terminal for the full Security Center.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
