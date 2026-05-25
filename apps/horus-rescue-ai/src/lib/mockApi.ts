// ===================================================================
// Horus Rescue AI — Mock API / in-memory backend
// -------------------------------------------------------------------
// A single external store (useSyncExternalStore friendly) that holds
// all application state and exposes service functions mirroring the
// planned REST endpoints:
//
//   POST /api/ir-alert          -> postIrAlert()
//   POST /api/camera-detection  -> postCameraDetection()
//   POST /api/manual-report     -> postManualReport()
//   GET  /api/reports           -> getReports()
//   GET  /api/checkpoints       -> getCheckpoints()
//   GET  /api/cameras           -> getCameras()
//
// Swap this layer for Supabase (see supabaseClient.ts + schema.sql)
// without changing any UI code.
// ===================================================================

import type {
  AppState,
  CameraDevice,
  CheckpointDevice,
  EmergencyReport,
  EmergencyType,
  RescueTeam,
  ReportSource,
  ReportStatus,
  Settings,
  TimelineEvent,
  TimelineEventType,
  TimelineSeverity,
  Toast,
} from "@/types";
import { calculateRiskScore, priorityFromScore } from "@/lib/riskEngine";
import {
  LOCATIONS,
  seedCameras,
  seedCheckpoints,
  seedReports,
  seedTeams,
  seedTimeline,
} from "@/data/seed";
import { nextReportId, nowISO, pick, randInt, uid } from "@/lib/utils";

const DEFAULT_SETTINGS: Settings = {
  mode: "Demo",
  soundAlerts: true,
  autoAssignTeams: true,
  criticalThreshold: 81,
  irAlertEndpoint: "/api/ir-alert",
  organizationName: "Horus Operations Center",
};

const EMERGENCY_TYPES: EmergencyType[] = [
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

const HIGH_RISK_LOCATIONS = new Set<string>([
  "North Stadium Tunnel",
  "Parking Level -2",
  "West Stairwell 4",
]);

function locationRisk(loc: string): "low" | "medium" | "high" {
  if (HIGH_RISK_LOCATIONS.has(loc)) return "high";
  return "medium";
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function freshState(): AppState {
  return {
    reports: clone(seedReports),
    checkpoints: clone(seedCheckpoints),
    cameras: clone(seedCameras),
    teams: clone(seedTeams),
    timeline: clone(seedTimeline),
    toasts: [],
    simulations: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

// -------------------------------------------------------------------
// Store implementation
// -------------------------------------------------------------------

type Listener = () => void;

class RescueStore {
  private state: AppState = freshState();
  private listeners = new Set<Listener>();

  getState = (): AppState => this.state;

  subscribe = (fn: Listener): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit() {
    for (const fn of this.listeners) fn();
  }

  private set(updater: (s: AppState) => AppState) {
    this.state = updater(this.state);
    this.emit();
  }

  // ---- Toasts ----------------------------------------------------

  pushToast = (
    title: string,
    message: string,
    severity: TimelineSeverity = "info",
  ): string => {
    const toast: Toast = { id: uid("toast"), title, message, severity };
    this.set((s) => ({ ...s, toasts: [...s.toasts, toast] }));
    return toast.id;
  };

  dismissToast = (id: string) => {
    this.set((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
  };

  // ---- Timeline --------------------------------------------------

  pushTimeline = (
    type: TimelineEventType,
    title: string,
    description: string,
    severity: TimelineSeverity = "info",
  ): TimelineEvent => {
    const ev: TimelineEvent = {
      id: uid("ev"),
      timestamp: nowISO(),
      type,
      title,
      description,
      severity,
    };
    this.set((s) => ({ ...s, timeline: [ev, ...s.timeline].slice(0, 120) }));
    return ev;
  };

  // ---- Reads (GET endpoints) -------------------------------------

  getReports = (): EmergencyReport[] => this.state.reports;
  getCheckpoints = (): CheckpointDevice[] => this.state.checkpoints;
  getCameras = (): CameraDevice[] => this.state.cameras;
  getTeams = (): RescueTeam[] => this.state.teams;

  // ---- Report helpers --------------------------------------------

  private insertReport(report: EmergencyReport) {
    this.set((s) => ({ ...s, reports: [report, ...s.reports] }));
    if (this.state.settings.autoAssignTeams && report.priority === "Critical") {
      this.autoAssign(report.id);
    }
  }

  private autoAssign(reportId: string) {
    const report = this.state.reports.find((r) => r.id === reportId);
    if (!report || report.assignedTeam) return;
    const preferred =
      report.type === "Fire"
        ? "Fire"
        : report.medicalNeeded
          ? "Medical"
          : "Rescue";
    const team =
      this.state.teams.find(
        (t) => t.status === "Available" && t.type === preferred,
      ) ?? this.state.teams.find((t) => t.status === "Available");
    if (!team) return;
    this.assignTeam(reportId, team.id);
  }

  // ---- POST /api/manual-report -----------------------------------

  postManualReport = (input: {
    type: EmergencyType;
    location: string;
    description: string;
    affectedPeople: number;
    trapped: boolean;
    medicalNeeded: boolean;
  }): EmergencyReport => {
    const manualSeverity =
      0.3 +
      (input.trapped ? 0.35 : 0) +
      (input.medicalNeeded ? 0.2 : 0) +
      Math.min(0.15, input.affectedPeople * 0.03);

    const risk = calculateRiskScore({
      emergencyType: input.type,
      peopleCount: input.affectedPeople,
      locationRisk: locationRisk(input.location),
      manualSeverity,
      trapped: input.trapped,
      medicalNeeded: input.medicalNeeded,
    });

    const report: EmergencyReport = {
      id: nextReportId(),
      type: input.type,
      source: "Manual",
      location: input.location,
      description: input.description || "Manual emergency report.",
      riskScore: risk.score,
      priority: risk.priority,
      status: "New",
      createdAt: nowISO(),
      assignedTeam: null,
      aiExplanation: risk.explanation,
      recommendation: risk.recommendation,
      cameraEvidence: null,
      irEvidence: null,
      affectedPeople: input.affectedPeople,
      trapped: input.trapped,
      medicalNeeded: input.medicalNeeded,
    };

    this.insertReport(report);
    this.pushTimeline(
      "report",
      `Manual report ${report.id}`,
      `${input.type} reported at ${input.location} — ${risk.priority}.`,
      risk.priority === "Critical" ? "critical" : "info",
    );
    this.pushToast(
      `Report ${report.id} filed`,
      `${risk.priority} priority · risk ${risk.score}`,
      risk.priority === "Critical" ? "critical" : "success",
    );
    return report;
  };

  // ---- POST /api/camera-detection --------------------------------
  // Toggles a camera's detection state. If the linked checkpoint was
  // recently triggered, fuses into a high/critical report.

  postCameraDetection = (body: {
    cameraId: string;
    personDetected: boolean;
    peopleCount?: number;
    confidence?: number;
  }): EmergencyReport | null => {
    const cam = this.state.cameras.find((c) => c.id === body.cameraId);
    if (!cam) return null;

    const peopleCount = body.personDetected
      ? Math.max(1, body.peopleCount ?? 1)
      : 0;
    const confidence = body.personDetected
      ? (body.confidence ?? 0.78 + Math.random() * 0.18)
      : 0;

    this.set((s) => ({
      ...s,
      cameras: s.cameras.map((c) =>
        c.id === cam.id
          ? {
              ...c,
              personDetected: body.personDetected,
              peopleCount,
              confidence: Number(confidence.toFixed(2)),
            }
          : c,
      ),
    }));

    if (!body.personDetected) {
      this.pushTimeline(
        "camera",
        `${cam.id} cleared`,
        `Detection cleared at ${cam.location}.`,
        "info",
      );
      return null;
    }

    this.pushTimeline(
      "camera",
      `Camera AI detection — ${cam.location}`,
      `${cam.id} detected ${peopleCount} person(s) at ${Math.round(
        confidence * 100,
      )}% confidence.`,
      "warning",
    );

    // Check for fusion with linked checkpoint.
    const checkpoint = cam.linkedCheckpointId
      ? this.state.checkpoints.find((cp) => cp.id === cam.linkedCheckpointId)
      : undefined;
    const recentlyTriggered =
      checkpoint?.irStatus === "Triggered" ||
      (checkpoint?.lastTriggered &&
        Date.now() - new Date(checkpoint.lastTriggered).getTime() < 60_000);

    const fused = Boolean(checkpoint && recentlyTriggered);
    const report = this.buildSensorReport({
      type: peopleCount > 2 ? "Stampede" : "Trapped Person",
      location: cam.location,
      source: fused ? "AI+IR Fusion" : "Camera AI",
      cameraPersonDetected: true,
      peopleCount,
      confidence: Number(confidence.toFixed(2)),
      inDangerZone: cam.dangerZoneActive,
      irTriggered: fused,
      checkpoint,
      cameraId: cam.id,
    });
    this.insertReport(report);
    this.emitSensorReportEvents(report, fused);
    return report;
  };

  // ---- POST /api/ir-alert ----------------------------------------

  postIrAlert = (body: {
    deviceId: string;
    location?: string;
    eventType?: string;
    message?: string;
  }): EmergencyReport | null => {
    const cp = this.state.checkpoints.find((c) => c.id === body.deviceId);
    if (!cp) {
      this.pushToast(
        "Unknown device",
        `No checkpoint named ${body.deviceId}.`,
        "warning",
      );
      return null;
    }

    const repeated = cp.crossingsToday + 1 >= 4;
    this.set((s) => ({
      ...s,
      checkpoints: s.checkpoints.map((c) =>
        c.id === cp.id
          ? {
              ...c,
              status: "Online",
              irStatus: "Triggered",
              crossingsToday: c.crossingsToday + 1,
              lastTriggered: nowISO(),
            }
          : c,
      ),
    }));

    this.pushTimeline(
      "ir",
      `IR crossing — ${cp.location}`,
      body.message || `${cp.id} registered movement.`,
      "warning",
    );

    // Auto-reset IR status after a short window (visual feedback).
    setTimeout(() => {
      this.set((s) => ({
        ...s,
        checkpoints: s.checkpoints.map((c) =>
          c.id === cp.id ? { ...c, irStatus: "Idle" } : c,
        ),
      }));
    }, 3500);

    // Fusion: does the linked camera currently see a person?
    const cam = cp.linkedCameraId
      ? this.state.cameras.find((c) => c.id === cp.linkedCameraId)
      : undefined;
    const fused = Boolean(cam?.personDetected);

    if (!fused) {
      // IR-only event — medium severity, no auto report unless repeated.
      this.pushToast(
        `IR crossing at ${cp.location}`,
        repeated ? "Repeated crossings — monitoring." : "Movement detected.",
        "warning",
      );
      if (repeated) {
        const report = this.buildSensorReport({
          type: "Unknown",
          location: cp.location,
          source: "IR Checkpoint",
          cameraPersonDetected: false,
          peopleCount: 0,
          confidence: 0,
          inDangerZone: false,
          irTriggered: true,
          repeatedCrossing: true,
          checkpoint: { ...cp, crossingsToday: cp.crossingsToday + 1 },
          cameraId: null,
        });
        this.insertReport(report);
        this.emitSensorReportEvents(report, false);
        return report;
      }
      return null;
    }

    const report = this.buildSensorReport({
      type: (cam?.peopleCount ?? 1) > 2 ? "Stampede" : "Trapped Person",
      location: cp.location,
      source: "AI+IR Fusion",
      cameraPersonDetected: true,
      peopleCount: cam?.peopleCount ?? 1,
      confidence: cam?.confidence ?? 0.85,
      inDangerZone: cam?.dangerZoneActive ?? false,
      irTriggered: true,
      repeatedCrossing: repeated,
      checkpoint: { ...cp, crossingsToday: cp.crossingsToday + 1 },
      cameraId: cam?.id ?? null,
    });
    this.insertReport(report);
    this.emitSensorReportEvents(report, true);
    return report;
  };

  private buildSensorReport(args: {
    type: EmergencyType;
    location: string;
    source: ReportSource;
    cameraPersonDetected: boolean;
    peopleCount: number;
    confidence: number;
    inDangerZone: boolean;
    irTriggered: boolean;
    repeatedCrossing?: boolean;
    checkpoint?: CheckpointDevice;
    cameraId: string | null;
  }): EmergencyReport {
    const risk = calculateRiskScore({
      cameraPersonDetected: args.cameraPersonDetected,
      peopleCount: args.peopleCount,
      irTriggered: args.irTriggered,
      inDangerZone: args.inDangerZone,
      repeatedCrossing: args.repeatedCrossing,
      emergencyType: args.type,
      locationRisk: locationRisk(args.location),
    });

    return {
      id: nextReportId(),
      type: args.type,
      source: args.source,
      location: args.location,
      description: describeSensorReport(args.source, args.location),
      riskScore: risk.score,
      priority: risk.priority,
      status: "New",
      createdAt: nowISO(),
      assignedTeam: null,
      aiExplanation: risk.explanation,
      recommendation: risk.recommendation,
      cameraEvidence: args.cameraPersonDetected
        ? {
            cameraId: args.cameraId ?? "CAM-?",
            peopleCount: args.peopleCount,
            confidence: args.confidence,
            dangerZone: args.inDangerZone,
            snapshotLabel: `${args.peopleCount} person(s) · ${
              args.inDangerZone ? "danger-zone" : "tracked"
            }`,
          }
        : null,
      irEvidence: args.irTriggered
        ? {
            deviceId: args.checkpoint?.id ?? "ESP-?",
            crossings: args.checkpoint?.crossingsToday ?? 1,
            repeated: Boolean(args.repeatedCrossing),
            lastTriggered: args.checkpoint?.lastTriggered ?? nowISO(),
          }
        : null,
      affectedPeople: args.peopleCount,
      trapped: args.type === "Trapped Person",
      medicalNeeded: risk.priority === "Critical" || risk.priority === "High",
    };
  }

  private emitSensorReportEvents(report: EmergencyReport, fused: boolean) {
    if (fused) {
      this.pushTimeline(
        "fusion",
        `AI + IR fusion → ${report.priority}`,
        `${report.id} cross-confirmed at ${report.location} (risk ${report.riskScore}).`,
        report.priority === "Critical" ? "critical" : "warning",
      );
    }
    if (report.priority === "Critical") {
      this.fireCriticalAlarm(report);
    } else {
      this.pushToast(
        `New ${report.priority} report ${report.id}`,
        `${report.type} at ${report.location} · risk ${report.riskScore}`,
        report.priority === "High" ? "warning" : "info",
      );
    }
  }

  private fireCriticalAlarm(report: EmergencyReport) {
    this.pushToast(
      `CRITICAL — ${report.id}`,
      `${report.type} at ${report.location}. Risk ${report.riskScore}. Dispatching.`,
      "critical",
    );
    // Activate buzzer + LED on the involved checkpoint.
    const deviceId = report.irEvidence?.deviceId;
    if (deviceId) {
      this.set((s) => ({
        ...s,
        checkpoints: s.checkpoints.map((c) =>
          c.id === deviceId
            ? { ...c, buzzerStatus: "On", ledStatus: "On" }
            : c,
        ),
      }));
    }
  }

  // ---- Device controls -------------------------------------------

  simulateIrCrossing = (deviceId: string) =>
    this.postIrAlert({
      deviceId,
      eventType: "IR_CROSSING",
      message: "Movement detected by IR checkpoint",
    });

  resetCheckpointCounter = (deviceId: string) => {
    this.set((s) => ({
      ...s,
      checkpoints: s.checkpoints.map((c) =>
        c.id === deviceId ? { ...c, crossingsToday: 0 } : c,
      ),
    }));
    this.pushToast("Counter reset", `${deviceId} crossings reset to 0.`, "info");
  };

  triggerAlarm = (deviceId: string) => {
    this.set((s) => ({
      ...s,
      checkpoints: s.checkpoints.map((c) =>
        c.id === deviceId
          ? { ...c, buzzerStatus: "On", ledStatus: "On" }
          : c,
      ),
    }));
    this.pushTimeline(
      "system",
      `Alarm triggered — ${deviceId}`,
      "Buzzer and LED activated on checkpoint device.",
      "critical",
    );
    this.pushToast("Alarm active", `${deviceId} buzzer + LED ON.`, "critical");
  };

  silenceAlarm = (deviceId: string) => {
    this.set((s) => ({
      ...s,
      checkpoints: s.checkpoints.map((c) =>
        c.id === deviceId
          ? { ...c, buzzerStatus: "Off", ledStatus: "Off" }
          : c,
      ),
    }));
    this.pushToast("Alarm silenced", `${deviceId} buzzer + LED OFF.`, "info");
  };

  setCheckpointStatus = (deviceId: string, status: "Online" | "Offline") => {
    this.set((s) => ({
      ...s,
      checkpoints: s.checkpoints.map((c) =>
        c.id === deviceId ? { ...c, status } : c,
      ),
    }));
    this.pushTimeline(
      "system",
      `${deviceId} ${status}`,
      `Checkpoint marked ${status}.`,
      status === "Offline" ? "warning" : "success",
    );
  };

  setCameraDetection = (
    cameraId: string,
    personDetected: boolean,
    peopleCount?: number,
  ) =>
    this.postCameraDetection({
      cameraId,
      personDetected,
      peopleCount,
    });

  clearCameraDetection = (cameraId: string) =>
    this.postCameraDetection({ cameraId, personDetected: false });

  setCameraStatus = (cameraId: string, status: "Online" | "Offline") => {
    this.set((s) => ({
      ...s,
      cameras: s.cameras.map((c) =>
        c.id === cameraId ? { ...c, status } : c,
      ),
    }));
  };

  // ---- Reports workflow ------------------------------------------

  assignTeam = (reportId: string, teamId: string) => {
    const team = this.state.teams.find((t) => t.id === teamId);
    const report = this.state.reports.find((r) => r.id === reportId);
    if (!team || !report) return;
    this.set((s) => ({
      ...s,
      teams: s.teams.map((t) =>
        t.id === teamId
          ? { ...t, status: "Assigned", assignedReportId: reportId }
          : t.assignedReportId === reportId
            ? { ...t, status: "Available", assignedReportId: null }
            : t,
      ),
      reports: s.reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              assignedTeam: team.name,
              status: r.status === "New" ? "Assigned" : r.status,
            }
          : r,
      ),
    }));
    this.pushTimeline(
      "team",
      `${team.name} assigned`,
      `${team.name} dispatched to ${report.location} (${reportId}).`,
      "success",
    );
    this.pushToast("Team assigned", `${team.name} → ${reportId}`, "success");
  };

  updateReportStatus = (reportId: string, status: ReportStatus) => {
    const report = this.state.reports.find((r) => r.id === reportId);
    if (!report) return;
    const teamStatus =
      status === "En Route"
        ? "En Route"
        : status === "On Scene"
          ? "On Scene"
          : status === "Resolved"
            ? "Returning"
            : "Assigned";
    this.set((s) => ({
      ...s,
      reports: s.reports.map((r) =>
        r.id === reportId ? { ...r, status } : r,
      ),
      teams: s.teams.map((t) =>
        t.assignedReportId === reportId
          ? {
              ...t,
              status: status === "Resolved" ? "Available" : teamStatus,
              assignedReportId: status === "Resolved" ? null : t.assignedReportId,
            }
          : t,
      ),
    }));
    this.pushTimeline(
      "team",
      `${reportId} → ${status}`,
      `Status updated for ${report.type} at ${report.location}.`,
      status === "Resolved" ? "success" : "info",
    );
  };

  escalateReport = (reportId: string) => {
    const report = this.state.reports.find((r) => r.id === reportId);
    if (!report) return;
    const newScore = Math.min(100, report.riskScore + 20);
    this.set((s) => ({
      ...s,
      reports: s.reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              riskScore: newScore,
              priority: priorityFromScore(newScore),
              recommendation:
                "Escalated by operator — dispatch immediately and notify incident command.",
            }
          : r,
      ),
    }));
    this.pushTimeline(
      "system",
      `${reportId} escalated`,
      `Risk raised to ${newScore} (${priorityFromScore(newScore)}).`,
      "critical",
    );
    this.pushToast("Escalated", `${reportId} risk now ${newScore}.`, "critical");
    if (this.state.settings.autoAssignTeams) this.autoAssign(reportId);
  };

  // ---- Settings --------------------------------------------------

  updateSettings = (patch: Partial<Settings>) => {
    this.set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  };

  // ---- Simulation ------------------------------------------------

  generateCriticalScenario = (): EmergencyReport => {
    // Turn on a danger-zone camera, then fire its checkpoint → fusion.
    const cam =
      this.state.cameras.find((c) => c.dangerZoneActive && c.status === "Online") ??
      this.state.cameras[0];
    this.setCameraDetection(cam.id, true, randInt(1, 3));
    const cpId = cam.linkedCheckpointId;
    const report = cpId
      ? this.simulateIrCrossing(cpId)
      : this.postCameraDetection({ cameraId: cam.id, personDetected: true });
    return (
      report ??
      this.state.reports[0] ?? ({} as EmergencyReport)
    );
  };

  runDisasterSimulation = (count = 20) => {
    const startedAt = nowISO();
    let critical = 0;

    for (let i = 0; i < count; i++) {
      const type = pick(EMERGENCY_TYPES);
      const location = pick(LOCATIONS);
      const cameraPersonDetected = Math.random() > 0.35;
      const irTriggered = Math.random() > 0.4;
      const peopleCount = cameraPersonDetected ? randInt(1, 6) : 0;
      const inDangerZone = Math.random() > 0.55;
      const repeatedCrossing = irTriggered && Math.random() > 0.6;

      const risk = calculateRiskScore({
        cameraPersonDetected,
        peopleCount,
        irTriggered,
        inDangerZone,
        repeatedCrossing,
        emergencyType: type,
        locationRisk: locationRisk(location),
      });
      if (risk.priority === "Critical") critical++;

      const source: ReportSource =
        cameraPersonDetected && irTriggered
          ? "AI+IR Fusion"
          : cameraPersonDetected
            ? "Camera AI"
            : irTriggered
              ? "IR Checkpoint"
              : "Manual";

      const report: EmergencyReport = {
        id: nextReportId(),
        type,
        source,
        location,
        description: describeSensorReport(source, location),
        riskScore: risk.score,
        priority: risk.priority,
        status: "New",
        createdAt: new Date(Date.now() - randInt(0, 30) * 60_000).toISOString(),
        assignedTeam: null,
        aiExplanation: risk.explanation,
        recommendation: risk.recommendation,
        cameraEvidence: cameraPersonDetected
          ? {
              cameraId: pick(this.state.cameras).id,
              peopleCount,
              confidence: Number((0.7 + Math.random() * 0.29).toFixed(2)),
              dangerZone: inDangerZone,
              snapshotLabel: `${peopleCount} person(s) · ${
                inDangerZone ? "danger-zone" : "tracked"
              }`,
            }
          : null,
        irEvidence: irTriggered
          ? {
              deviceId: pick(this.state.checkpoints).id,
              crossings: randInt(1, 6),
              repeated: repeatedCrossing,
              lastTriggered: nowISO(),
            }
          : null,
        affectedPeople: peopleCount,
        trapped: type === "Trapped Person",
        medicalNeeded: risk.priority !== "Low",
      };

      this.set((s) => ({ ...s, reports: [report, ...s.reports] }));
    }

    this.set((s) => ({
      ...s,
      simulations: [
        {
          id: uid("sim"),
          startedAt,
          scenario: "Mass-casualty disaster drill",
          reportsGenerated: count,
          criticalCount: critical,
        },
        ...s.simulations,
      ],
    }));

    if (this.state.settings.autoAssignTeams) {
      this.state.reports
        .filter((r) => r.priority === "Critical" && !r.assignedTeam)
        .slice(0, this.state.teams.length)
        .forEach((r) => this.autoAssign(r.id));
    }

    this.pushTimeline(
      "system",
      "Disaster simulation executed",
      `${count} reports generated · ${critical} critical.`,
      "critical",
    );
    this.pushToast(
      "Simulation complete",
      `${count} reports · ${critical} critical alerts.`,
      "critical",
    );
  };

  resetDemo = () => {
    this.state = freshState();
    this.emit();
    this.pushToast("Demo reset", "All data restored to seed state.", "info");
  };
}

function describeSensorReport(source: ReportSource, location: string): string {
  switch (source) {
    case "AI+IR Fusion":
      return `Camera AI detection cross-confirmed by IR checkpoint at ${location}.`;
    case "Camera AI":
      return `Camera AI detected person(s) at ${location}.`;
    case "IR Checkpoint":
      return `IR checkpoint registered repeated movement at ${location}.`;
    default:
      return `Reported activity at ${location}.`;
  }
}

// Singleton — the app's mock backend.
export const store = new RescueStore();

// REST-style named exports (thin facade over the singleton).
export const postIrAlert = store.postIrAlert;
export const postCameraDetection = store.postCameraDetection;
export const postManualReport = store.postManualReport;
export const getReports = store.getReports;
export const getCheckpoints = store.getCheckpoints;
export const getCameras = store.getCameras;
