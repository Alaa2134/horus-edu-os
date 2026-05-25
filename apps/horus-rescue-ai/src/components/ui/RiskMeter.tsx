import { priorityFromScore } from "@/lib/riskEngine";
import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

/** Circular risk gauge, 0..100. */
export function RiskMeter({ score, size = 120, showLabel = true }: RiskMeterProps) {
  const priority = priorityFromScore(score);
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const color =
    priority === "Critical"
      ? "#FF8A00"
      : priority === "High"
        ? "#FF3B3B"
        : priority === "Medium"
          ? "#00E5FF"
          : "#22C55E";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.7s ease, stroke 0.4s ease",
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-extrabold leading-none"
          style={{ color }}
        >
          {score}
        </span>
        {showLabel && (
          <span
            className={cn(
              "mt-1 text-[10px] font-bold uppercase tracking-widest",
              priority === "Critical" && "animate-blink",
            )}
            style={{ color }}
          >
            {priority}
          </span>
        )}
      </div>
    </div>
  );
}

/** Horizontal risk bar variant. */
export function RiskBar({ score }: { score: number }) {
  const priority = priorityFromScore(score);
  const color =
    priority === "Critical"
      ? "bg-critical"
      : priority === "High"
        ? "bg-danger"
        : priority === "Medium"
          ? "bg-ai"
          : "bg-ok";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold tabular-nums text-white">
        {score}
      </span>
    </div>
  );
}
