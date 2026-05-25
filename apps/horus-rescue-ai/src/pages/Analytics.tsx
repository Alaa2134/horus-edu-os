import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  MapPin,
  Flame,
  Layers,
  Cpu,
  Camera,
  Gauge,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { useAppState } from "@/store/useStore";

const TOOLTIP = {
  contentStyle: {
    background: "#0B1020",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: "#fff" },
};

const SOURCE_COLORS: Record<string, string> = {
  Manual: "#94A3B8",
  "Camera AI": "#00E5FF",
  "IR Checkpoint": "#FF8A00",
  "AI+IR Fusion": "#FF3B3B",
};

function Insight({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export function Analytics() {
  const state = useAppState();

  const data = useMemo(() => {
    const reports = state.reports;
    const countBy = <K extends string>(keyFn: (r: (typeof reports)[number]) => K) =>
      reports.reduce<Record<string, number>>((acc, r) => {
        const k = keyFn(r);
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {});

    const byType = Object.entries(countBy((r) => r.type)).map(([name, value]) => ({ name, value }));
    const bySource = Object.entries(countBy((r) => r.source)).map(([name, value]) => ({ name, value }));
    const byStatus = Object.entries(countBy((r) => r.status)).map(([name, value]) => ({ name, value }));

    const buckets = [
      { name: "0-30", value: 0 },
      { name: "31-60", value: 0 },
      { name: "61-80", value: 0 },
      { name: "81-100", value: 0 },
    ];
    for (const r of reports) {
      if (r.riskScore <= 30) buckets[0].value++;
      else if (r.riskScore <= 60) buckets[1].value++;
      else if (r.riskScore <= 80) buckets[2].value++;
      else buckets[3].value++;
    }

    // Time series over last 12 intervals (simulated 5-min buckets).
    const series = Array.from({ length: 12 }).map((_, i) => {
      const label = `${(i + 1) * 5}m`;
      return {
        name: label,
        ir: Math.max(0, Math.round(4 + Math.sin(i / 1.6) * 3 + Math.random() * 2)),
        camera: Math.max(0, Math.round(3 + Math.cos(i / 2) * 2.5 + Math.random() * 2)),
      };
    });

    // Insights
    const topCheckpoint = [...state.checkpoints].sort((a, b) => b.crossingsToday - a.crossingsToday)[0];
    const locCount = countBy((r) => r.location);
    const riskByLoc = reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.location] = Math.max(acc[r.location] ?? 0, r.riskScore);
      return acc;
    }, {});
    const highestRiskLoc = Object.entries(riskByLoc).sort((a, b) => b[1] - a[1])[0];
    const topType = Object.entries(locCount); // placeholder
    void topType;
    const freqType = Object.entries(countBy((r) => r.type)).sort((a, b) => b[1] - a[1])[0];
    const fusion = reports.filter((r) => r.source === "AI+IR Fusion").length;
    const sensorReports = reports.filter((r) => r.source !== "Manual").length || 1;
    const confirmRate = Math.round((fusion / sensorReports) * 100);

    return {
      byType,
      bySource,
      byStatus,
      buckets,
      series,
      topCheckpoint,
      highestRiskLoc,
      freqType,
      confirmRate,
    };
  }, [state]);

  const bucketColors = ["#22C55E", "#00E5FF", "#FF3B3B", "#FF8A00"];

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Operational intelligence across reports, sensors and response."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Insight
          icon={Cpu}
          label="Most active checkpoint"
          value={data.topCheckpoint ? `${data.topCheckpoint.location} (${data.topCheckpoint.crossingsToday})` : "—"}
          accent="text-critical"
        />
        <Insight
          icon={MapPin}
          label="Highest risk location"
          value={data.highestRiskLoc ? `${data.highestRiskLoc[0]} (${data.highestRiskLoc[1]})` : "—"}
          accent="text-danger"
        />
        <Insight
          icon={Flame}
          label="Most frequent type"
          value={data.freqType ? `${data.freqType[0]} (${data.freqType[1]})` : "—"}
          accent="text-critical"
        />
        <Insight
          icon={Layers}
          label="AI + IR confirmation rate"
          value={`${data.confirmRate}%`}
          accent="text-ai"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <CardHeader title="Reports by Type" icon={<Flame className="h-4 w-4" />} />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byType} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={110} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} {...TOOLTIP} />
                <Bar dataKey="value" fill="#00E5FF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <CardHeader title="Reports by Source" icon={<Camera className="h-4 w-4" />} />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.bySource} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={3} stroke="none">
                  {data.bySource.map((e) => (
                    <Cell key={e.name} fill={SOURCE_COLORS[e.name] ?? "#64748B"} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <CardHeader title="Risk Score Distribution" icon={<Gauge className="h-4 w-4" />} />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} {...TOOLTIP} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.buckets.map((_, i) => (
                    <Cell key={i} fill={bucketColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <CardHeader title="Response Status Distribution" icon={<TrendingUp className="h-4 w-4" />} />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} {...TOOLTIP} />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <CardHeader
            title="IR Events vs Camera Detections (over time)"
            icon={<Layers className="h-4 w-4" />}
          />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="ir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF8A00" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#FF8A00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip {...TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="ir" name="IR events" stroke="#FF8A00" fill="url(#ir)" strokeWidth={2} />
                <Area type="monotone" dataKey="camera" name="Camera detections" stroke="#00E5FF" fill="url(#cam)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
