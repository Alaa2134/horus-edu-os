import { useEffect } from "react";
import { useActions, useSelector } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Siren,
  X,
} from "lucide-react";
import type { Toast as ToastType } from "@/types";

const META = {
  critical: { icon: Siren, cls: "border-critical/50 text-critical", bar: "bg-critical" },
  warning: { icon: AlertTriangle, cls: "border-danger/50 text-danger", bar: "bg-danger" },
  success: { icon: CheckCircle2, cls: "border-ok/50 text-ok", bar: "bg-ok" },
  info: { icon: Info, cls: "border-ai/50 text-ai", bar: "bg-ai" },
} as const;

function ToastItem({ toast }: { toast: ToastType }) {
  const actions = useActions();
  const meta = META[toast.severity];
  const Icon = meta.icon;

  useEffect(() => {
    const ms = toast.severity === "critical" ? 7000 : 4500;
    const id = setTimeout(() => actions.dismissToast(toast.id), ms);
    return () => clearTimeout(id);
  }, [toast.id, toast.severity, actions]);

  return (
    <div
      className={cn(
        "glass-strong animate-slide-in pointer-events-auto w-80 overflow-hidden border-l-4 p-3.5 pr-9",
        meta.cls,
      )}
      role="alert"
    >
      <button
        onClick={() => actions.dismissToast(toast.id)}
        className="absolute right-2 top-2 text-slate-400 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            toast.severity === "critical" && "animate-blink",
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          <p className="mt-0.5 text-xs text-slate-300">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

export function ToastHost() {
  const toasts = useSelector((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
