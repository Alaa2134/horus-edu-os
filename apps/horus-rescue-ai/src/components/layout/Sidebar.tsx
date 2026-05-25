import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  Camera,
  FileText,
  KanbanSquare,
  BarChart3,
  FlaskConical,
  Smartphone,
  Settings,
  Info,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "@/store/useStore";

const NAV = [
  { to: "/app", end: true, label: "Command Dashboard", icon: LayoutDashboard },
  { to: "/app/checkpoints", label: "Smart Checkpoints", icon: Cpu },
  { to: "/app/cameras", label: "AI Camera Detection", icon: Camera },
  { to: "/app/reports", label: "Emergency Reports", icon: FileText, badge: true },
  { to: "/app/rescue", label: "Rescue Team Board", icon: KanbanSquare },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/simulation", label: "Simulation", icon: FlaskConical },
  { to: "/mobile", label: "Mobile Report", icon: Smartphone },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/about", label: "About / Pitch", icon: Info },
] as const;

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const criticalCount = useSelector(
    (s) =>
      s.reports.filter(
        (r) => r.priority === "Critical" && r.status !== "Resolved",
      ).length,
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-bg-900/80 backdrop-blur-2xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ai to-danger text-bg-900">
              <ShieldAlert className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight text-white">
                Horus Rescue
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ai">
                AI Command
              </p>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
                onClick={onClose}
                className={({ isActive }) =>
                  cn("nav-link", isActive && "nav-link-active")
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {"badge" in item && item.badge && criticalCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-critical px-1.5 text-[10px] font-bold text-bg-900 animate-blink">
                    {criticalCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[10px] leading-relaxed text-slate-500">
            Report · Detect · Prioritize · Rescue
          </p>
          <p className="mt-1 text-[10px] text-slate-600">
            v1.0 · Hackathon Demo Build
          </p>
        </div>
      </aside>
    </>
  );
}
