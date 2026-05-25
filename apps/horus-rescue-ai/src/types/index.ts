// ===================================================================
// Horus Rescue AI — Core domain types
// ===================================================================

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type ReportSource =
  | "Manual"
  | "Camera AI"
  | "IR Checkpoint"
  | "AI+IR Fusion";

export type ReportStatus =
  | "New"
  | "Assigned"
  | "En Route"
  | "On Scene"
  | "Resolved";

export type EmergencyType =
  | "Fire"
  | "Medical"
  | "Trapped Person"
  | "Structural Collapse"
  | "Flood"
  | "Gas Leak"
  | "Stampede"
  | "Security Threat"
  | "Unknown";

export type DeviceStatus = "Online" | "Offline";
export type IRStatus = "Idle" | "Triggered";
export type ToggleStatus = "On" | "Off";

export type TimelineSeverity = "info" | "success" | "warning" | "critical";

export type TimelineEventType =
  | "report"
  | "ir"
  | "camera"
  | "fusion"
  | "team"
  | "system";

// ---- Evidence attached to a report ---------------------------------

export interface CameraEvidence {
  cameraId: string;
  peopleCount: number;
  confidence: number; // 0..1
  dangerZone: boolean;
  snapshotLabel: string;
}

export interface IREvidence {
  deviceId: string;
  crossings: number;
  repeated: boolean;
  lastTriggered: string; // ISO
}

// ---- Reports -------------------------------------------------------

export interface EmergencyReport {
  id: string;
  type: EmergencyType;
  source: ReportSource;
  location: string;
  description: string;
  riskScore: number; // 0..100
  priority: Priority;
  status: ReportStatus;
  createdAt: string; // ISO
  assignedTeam: string | null;
  aiExplanation: string;
  recommendation: string;
  cameraEvidence: CameraEvidence | null;
  irEvidence: IREvidence | null;
  affectedPeople?: number;
  trapped?: boolean;
  medicalNeeded?: boolean;
}

// ---- Checkpoint devices (ESP32 + IR) -------------------------------

export interface CheckpointDevice {
  id: string;
  location: string;
  status: DeviceStatus;
  irStatus: IRStatus;
  crossingsToday: number;
  lastTriggered: string | null; // ISO
  linkedCameraId: string | null;
  buzzerStatus: ToggleStatus;
  ledStatus: ToggleStatus;
  riskContribution: number;
  battery: number; // 0..100
  powerSource: "Battery" | "USB" | "PoE";
}

// ---- Camera devices ------------------------------------------------

export interface CameraDevice {
  id: string;
  location: string;
  status: DeviceStatus;
  personDetected: boolean;
  peopleCount: number;
  confidence: number; // 0..1
  dangerZoneActive: boolean;
  linkedCheckpointId: string | null;
}

// ---- Timeline ------------------------------------------------------

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO
  type: TimelineEventType;
  title: string;
  description: string;
  severity: TimelineSeverity;
}

// ---- Rescue teams --------------------------------------------------

export type RescueTeamStatus =
  | "Available"
  | "Assigned"
  | "En Route"
  | "On Scene"
  | "Returning";

export type RescueTeamType = "Rescue" | "Medical" | "Fire" | "Security";

export interface RescueTeam {
  id: string;
  name: string;
  type: RescueTeamType;
  status: RescueTeamStatus;
  assignedReportId: string | null;
}

// ---- Simulation ----------------------------------------------------

export interface SimulationRun {
  id: string;
  startedAt: string;
  scenario: string;
  reportsGenerated: number;
  criticalCount: number;
}

// ---- Toasts --------------------------------------------------------

export interface Toast {
  id: string;
  title: string;
  message: string;
  severity: TimelineSeverity;
}

// ---- Settings ------------------------------------------------------

export type OperationMode = "Demo" | "Hardware";

export interface Settings {
  mode: OperationMode;
  soundAlerts: boolean;
  autoAssignTeams: boolean;
  criticalThreshold: number; // score at which critical alarms fire
  irAlertEndpoint: string;
  organizationName: string;
}

// ---- Aggregate app state ------------------------------------------

export interface AppState {
  reports: EmergencyReport[];
  checkpoints: CheckpointDevice[];
  cameras: CameraDevice[];
  teams: RescueTeam[];
  timeline: TimelineEvent[];
  toasts: Toast[];
  simulations: SimulationRun[];
  settings: Settings;
}
