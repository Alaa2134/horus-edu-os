import { useMemo, useState } from "react";
import { Filter, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReportRow } from "@/components/ReportRow";
import { useAppState } from "@/store/useStore";
import { LOCATIONS } from "@/data/seed";
import type { Priority, ReportSource, ReportStatus } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITIES: (Priority | "All")[] = ["All", "Critical", "High", "Medium", "Low"];
const STATUSES: (ReportStatus | "All")[] = ["All", "New", "Assigned", "En Route", "On Scene", "Resolved"];
const SOURCES: (ReportSource | "All")[] = ["All", "Manual", "Camera AI", "IR Checkpoint", "AI+IR Fusion"];

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="input-field py-2 text-xs"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-bg-800">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Reports() {
  const { reports } = useAppState();
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [status, setStatus] = useState<ReportStatus | "All">("All");
  const [source, setSource] = useState<ReportSource | "All">("All");
  const [location, setLocation] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return reports
      .filter((r) => (priority === "All" ? true : r.priority === priority))
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) => (source === "All" ? true : r.source === source))
      .filter((r) => (location === "All" ? true : r.location === location))
      .filter((r) =>
        query.trim() === ""
          ? true
          : `${r.id} ${r.type} ${r.location} ${r.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
      )
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [reports, priority, status, source, location, query]);

  return (
    <div>
      <PageHeader
        title="Emergency Reports"
        subtitle="Every incident — manual, camera, checkpoint or fused — ranked by risk."
        actions={
          <span className="chip border-ai/40 bg-ai/15 text-sm text-ai">
            <FileText className="h-4 w-4" /> {filtered.length} of {reports.length}
          </span>
        }
      />

      <GlassCard className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Search
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ID, type, location…"
                className="input-field py-2 pl-8 text-xs"
              />
            </div>
          </label>
          <Select label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} />
          <Select label="Status" value={status} options={STATUSES} onChange={setStatus} />
          <Select label="Source" value={source} options={SOURCES} onChange={setSource} />
          <Select label="Location" value={location} options={["All", ...LOCATIONS]} onChange={setLocation} />
        </div>
        {(priority !== "All" || status !== "All" || source !== "All" || location !== "All" || query) && (
          <button
            onClick={() => {
              setPriority("All");
              setStatus("All");
              setSource("All");
              setLocation("All");
              setQuery("");
            }}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ai hover:text-cyan-300"
          >
            <Filter className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </GlassCard>

      <GlassCard>
        <div className={cn("divide-y divide-white/5")}>
          {filtered.map((r) => (
            <ReportRow key={r.id} report={r} />
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-500">
              No reports match the current filters.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
