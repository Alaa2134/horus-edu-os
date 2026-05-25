import {
  Settings as SettingsIcon,
  Zap,
  Volume2,
  Users,
  Gauge,
  Building2,
  Database,
  RotateCcw,
  Server,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard, CardHeader } from "@/components/ui/GlassCard";
import { useActions, useAppState } from "@/store/useStore";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

function Toggle({
  on,
  onClick,
}: {
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        on ? "bg-ai" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          on ? "left-0.5 translate-x-5" : "left-0.5",
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Zap;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-ai">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { settings } = useAppState();
  const actions = useActions();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure operation mode, alerts and integrations."
        actions={
          <button onClick={() => actions.resetDemo()} className="btn-ghost text-sm">
            <RotateCcw className="h-4 w-4" /> Reset Demo Data
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <CardHeader title="Operations" icon={<SettingsIcon className="h-4 w-4" />} />
          <div className="divide-y divide-white/5">
            <SettingRow
              icon={Zap}
              title="Operation mode"
              desc="Demo runs fully offline. Hardware mode expects live ESP32/camera feeds."
            >
              <div className="flex gap-1 rounded-lg border border-white/10 bg-bg-800 p-1">
                {(["Demo", "Hardware"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => actions.updateSettings({ mode })}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      settings.mode === mode
                        ? mode === "Demo"
                          ? "bg-ai text-bg-900"
                          : "bg-critical text-bg-900"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow icon={Volume2} title="Sound alerts" desc="Audible cue on critical fusion events.">
              <Toggle on={settings.soundAlerts} onClick={() => actions.updateSettings({ soundAlerts: !settings.soundAlerts })} />
            </SettingRow>

            <SettingRow icon={Users} title="Auto-assign teams" desc="Automatically dispatch the nearest available team on Critical.">
              <Toggle on={settings.autoAssignTeams} onClick={() => actions.updateSettings({ autoAssignTeams: !settings.autoAssignTeams })} />
            </SettingRow>

            <SettingRow icon={Gauge} title="Critical threshold" desc={`Alarms fire at risk ≥ ${settings.criticalThreshold}.`}>
              <input
                type="range"
                min={60}
                max={100}
                value={settings.criticalThreshold}
                onChange={(e) => actions.updateSettings({ criticalThreshold: Number(e.target.value) })}
                className="w-28 accent-critical"
              />
            </SettingRow>
          </div>
        </GlassCard>

        <GlassCard>
          <CardHeader title="Organization & Integrations" icon={<Building2 className="h-4 w-4" />} />
          <div className="divide-y divide-white/5">
            <div className="px-5 py-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Organization name
              </label>
              <input
                value={settings.organizationName}
                onChange={(e) => actions.updateSettings({ organizationName: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="px-5 py-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Server className="mr-1 inline h-3.5 w-3.5" /> IR alert endpoint
              </label>
              <input
                value={settings.irAlertEndpoint}
                onChange={(e) => actions.updateSettings({ irAlertEndpoint: e.target.value })}
                className="input-field font-mono text-xs"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                ESP32 devices POST IR crossings here.
              </p>
            </div>

            <SettingRow
              icon={Database}
              title="Supabase backend"
              desc="Optional. Provide VITE_SUPABASE_URL & ANON_KEY to enable persistence."
            >
              <span
                className={cn(
                  "chip",
                  isSupabaseConfigured
                    ? "border-ok/40 bg-ok/15 text-ok"
                    : "border-slate-500/40 bg-slate-500/10 text-slate-400",
                )}
              >
                {isSupabaseConfigured ? "Connected" : "Offline (mock)"}
              </span>
            </SettingRow>
          </div>

          <div className="border-t border-white/5 px-5 py-4 text-xs text-slate-500">
            Schema is available at <span className="font-mono text-ai">supabase/schema.sql</span>.
            The app runs identically with or without a backend.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
