import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  glow?: string;
  as?: "div" | "section" | "article";
}

export function GlassCard({
  children,
  className,
  strong,
  glow,
  as: Tag = "div",
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        strong ? "glass-strong" : "glass",
        "relative",
        glow,
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  subtitle?: string;
}

export function CardHeader({ title, icon, action, subtitle }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-ai">{icon}</span>}
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
