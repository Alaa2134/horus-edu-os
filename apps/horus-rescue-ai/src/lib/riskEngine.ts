// ===================================================================
// Horus Rescue AI — Risk Scoring Engine
// -------------------------------------------------------------------
// Fuses AI camera detection with physical IR-checkpoint confirmation
// and contextual factors into a single 0..100 risk score.
// ===================================================================

import type { EmergencyType, Priority } from "@/types";

export interface RiskInput {
  cameraPersonDetected?: boolean;
  peopleCount?: number;
  irTriggered?: boolean;
  inDangerZone?: boolean;
  repeatedCrossing?: boolean;
  emergencyType?: EmergencyType;
  locationRisk?: "low" | "medium" | "high";
  /** Manual severity 0..1 reported by a human (mobile report). */
  manualSeverity?: number;
  trapped?: boolean;
  medicalNeeded?: boolean;
}

export interface RiskResult {
  score: number; // 0..100
  priority: Priority;
  explanation: string;
  recommendation: string;
  factors: RiskFactor[];
  fusion: boolean; // camera + IR both contributed
}

export interface RiskFactor {
  label: string;
  points: number;
}

const CRITICAL_TYPES: EmergencyType[] = [
  "Fire",
  "Structural Collapse",
  "Gas Leak",
  "Stampede",
];

export function priorityFromScore(score: number): Priority {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

/**
 * Core scoring function. Additive weights, clamped to 100.
 * Camera + IR fusion adds a synergy bonus to reflect the project's
 * core thesis: visual + physical confirmation = high confidence.
 */
export function calculateRiskScore(input: RiskInput): RiskResult {
  const factors: RiskFactor[] = [];
  const add = (label: string, points: number) => {
    if (points !== 0) factors.push({ label, points });
  };

  const peopleCount = input.peopleCount ?? 0;

  if (input.cameraPersonDetected) add("Camera detected a person", 30);
  if (input.irTriggered) add("IR checkpoint triggered", 25);

  if (peopleCount > 3) add("Crowd detected (3+ people)", 25);
  else if (peopleCount > 1) add("Multiple people detected", 15);

  if (input.inDangerZone) add("Subject inside danger zone", 30);
  if (input.repeatedCrossing) add("Repeated checkpoint crossings", 10);

  if (input.locationRisk === "high") add("High-risk location", 10);
  else if (input.locationRisk === "medium") add("Elevated-risk location", 5);

  if (input.emergencyType && CRITICAL_TYPES.includes(input.emergencyType)) {
    add(`Critical emergency type: ${input.emergencyType}`, 30);
  }

  if (input.trapped) add("Person reported trapped", 15);
  if (input.medicalNeeded) add("Medical assistance requested", 10);

  if (typeof input.manualSeverity === "number" && input.manualSeverity > 0) {
    add("Human-reported severity", Math.round(input.manualSeverity * 25));
  }

  // Fusion synergy bonus — visual + physical confirmation.
  const fusion = Boolean(input.cameraPersonDetected && input.irTriggered);
  if (fusion) add("AI + IR fusion confirmation", 10);

  const raw = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.max(0, Math.min(100, raw));
  const priority = priorityFromScore(score);

  return {
    score,
    priority,
    explanation: buildExplanation(input, factors, fusion, priority),
    recommendation: buildRecommendation(priority, input, fusion),
    factors,
    fusion,
  };
}

function buildExplanation(
  input: RiskInput,
  factors: RiskFactor[],
  fusion: boolean,
  priority: Priority,
): string {
  if (factors.length === 0) {
    return "No active risk signals detected. Situation appears nominal.";
  }
  const signals: string[] = [];
  if (input.cameraPersonDetected) {
    signals.push(
      `Camera AI confirmed ${input.peopleCount ?? 1} person(s) on scene`,
    );
  }
  if (input.irTriggered) {
    signals.push("IR checkpoint registered physical movement");
  }
  if (input.inDangerZone) signals.push("subject is inside a flagged danger zone");
  if (input.trapped) signals.push("a person is reported trapped");

  const lead = fusion
    ? "Cross-confirmed by both visual AI and physical checkpoint sensors. "
    : "";
  const tail =
    signals.length > 0
      ? `Signals: ${signals.join("; ")}.`
      : "Contextual factors elevated the score.";

  return `${lead}Computed ${priority} priority. ${tail}`;
}

function buildRecommendation(
  priority: Priority,
  input: RiskInput,
  fusion: boolean,
): string {
  switch (priority) {
    case "Critical":
      return fusion
        ? "Dispatch nearest rescue + medical unit immediately. Activate checkpoint alarm. Treat as confirmed life-threatening event."
        : "Dispatch rescue team immediately and escalate to incident command.";
    case "High":
      return input.medicalNeeded
        ? "Assign a medical unit and place rescue team on standby."
        : "Assign a rescue team and verify with the nearest camera/checkpoint.";
    case "Medium":
      return "Queue for response and request additional sensor confirmation.";
    default:
      return "Monitor. No immediate dispatch required.";
  }
}

/** Tailwind text/border color helpers for a priority. */
export function priorityColor(priority: Priority): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  switch (priority) {
    case "Critical":
      return {
        text: "text-critical",
        bg: "bg-critical/15",
        border: "border-critical/50",
        glow: "shadow-glow-critical",
      };
    case "High":
      return {
        text: "text-danger",
        bg: "bg-danger/15",
        border: "border-danger/50",
        glow: "shadow-glow-danger",
      };
    case "Medium":
      return {
        text: "text-ai",
        bg: "bg-ai/15",
        border: "border-ai/40",
        glow: "shadow-glow",
      };
    default:
      return {
        text: "text-ok",
        bg: "bg-ok/15",
        border: "border-ok/40",
        glow: "",
      };
  }
}
