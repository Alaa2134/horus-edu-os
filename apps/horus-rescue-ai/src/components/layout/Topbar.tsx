import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Activity, Zap, Wifi, Clock } from "lucide-react";
import { useSelector } from "@/store/useStore";
import { cn } from "@/lib/utils";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const [now, setNow] = useState(() => new Date());
  const mode = useSelector((s) => s.settings.mode);
  const org = useSelector((s) => s.settings.organizationName);
  const onlineDevices = useSelector(
    (s) =>
      s.checkpoints.filter((c) => c.status === "Online").length +
      s.cameras.filter((c) => c.status === "Online").length,
  );
  const totalDevices = useSelector(
    (s) => s.checkpoints.length + s.cameras.length,
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-bg-900/70 px-4 py-3 backdrop-blur-2xl">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-ai" />
        <span className="hidden text-sm font-semibold text-white sm:inline">
          {org}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 md:flex">
          <Wifi className="h-3.5 w-3.5 text-ok" />
          {onlineDevices}/{totalDevices} devices online
        </span>

        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
            mode === "Demo"
              ? "border-ai/40 bg-ai/10 text-ai"
              : "border-critical/40 bg-critical/10 text-critical",
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          {mode} mode
        </span>

        <span className="hidden items-center gap-1.5 font-mono text-xs text-slate-300 sm:flex">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>

        <Link to="/mobile" className="btn-danger px-3 py-2 text-xs">
          Report Emergency
        </Link>
      </div>
    </header>
  );
}
