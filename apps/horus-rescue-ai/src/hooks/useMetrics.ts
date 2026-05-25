import { useMemo } from "react";
import { useAppState } from "@/store/useStore";
import type { AppState, EmergencyReport, Priority } from "@/types";

export interface Metrics {
  totalReports: number;
  criticalAlerts: number;
  activeCheckpoints: number;
  totalCheckpoints: number;
  camerasDetecting: number;
  camerasOnline: number;
  irEventsToday: number;
  averageRisk: number;
  activeTeams: number;
  totalTeams: number;
  openReports: EmergencyReport[];
  criticalReports: EmergencyReport[];
  topCriticalReport: EmergencyReport | null;
  byPriority: Record<Priority, number>;
}

export function computeMetrics(s: AppState): Metrics {
  const open = s.reports.filter((r) => r.status !== "Resolved");
  const critical = open
    .filter((r) => r.priority === "Critical")
    .sort((a, b) => b.riskScore - a.riskScore);

  const avg =
    s.reports.length === 0
      ? 0
      : Math.round(
          s.reports.reduce((sum, r) => sum + r.riskScore, 0) / s.reports.length,
        );

  const byPriority: Record<Priority, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  for (const r of s.reports) byPriority[r.priority]++;

  return {
    totalReports: s.reports.length,
    criticalAlerts: critical.length,
    activeCheckpoints: s.checkpoints.filter((c) => c.status === "Online").length,
    totalCheckpoints: s.checkpoints.length,
    camerasDetecting: s.cameras.filter((c) => c.personDetected).length,
    camerasOnline: s.cameras.filter((c) => c.status === "Online").length,
    irEventsToday: s.checkpoints.reduce((sum, c) => sum + c.crossingsToday, 0),
    averageRisk: avg,
    activeTeams: s.teams.filter((t) => t.status !== "Available").length,
    totalTeams: s.teams.length,
    openReports: open.sort((a, b) => b.riskScore - a.riskScore),
    criticalReports: critical,
    topCriticalReport: critical[0] ?? null,
    byPriority,
  };
}

export function useMetrics(): Metrics {
  const state = useAppState();
  return useMemo(() => computeMetrics(state), [state]);
}
