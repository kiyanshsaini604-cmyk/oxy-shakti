import { Thermometer, Wind, Signal, Clock, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSectorTelemetry, type SectorLive } from "@/lib/api/sector-data.functions";
import { useSettings } from "@/lib/settings/settings-context";

type Status = "safe" | "warning" | "critical";

const fallback: SectorLive[] = [
  { id: "NODE-70", zone: "Sector 70 · Residential Block C", temp: 28.4, gas: 1.2, status: "safe", signal: 96, updated: new Date().toISOString() },
  { id: "NODE-82", zone: "Sector 82 · IT City · Tower B3", temp: 32.1, gas: 2.4, status: "safe", signal: 88, updated: new Date().toISOString() },
  { id: "NODE-P7", zone: "Phase 7 · Market Substation", temp: 31.6, gas: 3.1, status: "safe", signal: 72, updated: new Date().toISOString() },
  { id: "NODE-AC", zone: "Aerocity · Perimeter Gate 2", temp: 29.9, gas: 0.9, status: "safe", signal: 99, updated: new Date().toISOString() },
];

const tones: Record<Status, { dot: string; text: string; ring: string; bg: string; label: string }> = {
  safe: { dot: "bg-safe", text: "text-safe", ring: "border-safe/30", bg: "bg-safe/10", label: "Safe" },
  warning: { dot: "bg-warning", text: "text-warning", ring: "border-warning/40", bg: "bg-warning/10", label: "Warning" },
  critical: { dot: "bg-critical", text: "text-critical", ring: "border-critical/50", bg: "bg-critical/10", label: "Critical" },
};

const FIVE_MIN = 5 * 60 * 1000;

function relTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 5) return "live";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function NodeGrid() {
  const fetchFn = useServerFn(getSectorTelemetry);
  const { refreshMs, formatTime, settings } = useSettings();
  const interval = refreshMs || FIVE_MIN;
  const { data, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["sector-telemetry"],
    queryFn: () => fetchFn(),
    refetchInterval: interval,
    staleTime: interval,
    refetchOnWindowFocus: false,
    placeholderData: fallback,
  });

  const nodes = data ?? fallback;
  const lastSync = dataUpdatedAt ? formatTime(new Date(dataUpdatedAt).toISOString()) : "—";

  return (
    <section id="nodes" className="scroll-mt-24">
      <Header
        title="Live Node Status"
        subtitle={`Real-time telemetry · Open-Meteo · 4 sectors · synced ${lastSync}`}
        action={
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin text-cyan-glow" : ""}`} />
            {isFetching ? "Syncing" : `${settings.refreshMinutes}m cycle`}
          </span>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {nodes.map((n) => {
          const t = tones[n.status];
          return (
            <div key={n.id} className={`glass-panel p-4 relative overflow-hidden ${n.status === "critical" ? "border-critical/40" : ""}`}>
              {n.status === "critical" && <div className="absolute inset-0 bg-critical/5 pointer-events-none" />}
              <div className="relative flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${t.dot} animate-blink-dot`} />
                  <span className="font-mono text-sm text-foreground">{n.id}</span>
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border ${t.ring} ${t.bg} ${t.text}`}>
                  {t.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{n.zone}</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <Metric icon={<Thermometer className="h-3 w-3" />} label="Temp" value={`${n.temp}°C`} accent={n.temp > 45 ? "text-critical" : n.temp > 38 ? "text-warning" : "text-foreground"} />
                <Metric icon={<Wind className="h-3 w-3" />} label="Gas" value={`${n.gas} ppm`} accent={n.gas >= 15 ? "text-critical" : n.gas >= 5 ? "text-warning" : "text-foreground"} />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-panel-border/40 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{relTime(n.updated)}</span>
                <span className="flex items-center gap-1"><Signal className="h-3 w-3" />{n.signal}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-md bg-background/40 border border-panel-border/40 p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon} {label}
      </div>
      <div className={`font-mono text-base mt-1 ${accent}`}>{value}</div>
    </div>
  );
}

export function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
