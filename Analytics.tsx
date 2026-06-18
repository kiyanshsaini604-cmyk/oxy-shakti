import { Header } from "./NodeGrid";
import { useIntelFeed } from "@/lib/api/use-intel";
import { useSettings } from "@/lib/settings/settings-context";

function toPath(data: number[], w = 100, h = 40) {
  if (data.length < 2) return "";
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  return data.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(h - ((v - min) / range) * h).toFixed(2)}`).join(" ");
}

function Chart({ title, unit, color, value, delta, data }: { title: string; unit: string; color: string; value: string; delta: string; data: number[] }) {
  const path = toPath(data);
  const area = `${path} L100,40 L0,40 Z`;
  const id = title.replace(/\s/g, "");
  return (
    <div className="glass-panel p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
          <p className="font-display text-2xl font-semibold text-foreground mt-0.5">{value}<span className="text-xs text-muted-foreground ml-1 font-mono">{unit}</span></p>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ color, borderColor: `${color}55`, background: `${color}10` }}>{delta}</span>
      </div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-20">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${id})`} />
        <path d={path} stroke={color} strokeWidth="0.8" fill="none" style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
      </svg>
    </div>
  );
}

function deltaOf(series: number[]): string {
  if (series.length < 2) return "—";
  const a = series[0], b = series[series.length - 1];
  if (!a) return "—";
  const pct = ((b - a) / Math.abs(a)) * 100;
  if (Math.abs(pct) < 1) return "stable";
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

export function Analytics() {
  const { data } = useIntelFeed();
  const { settings } = useSettings();
  const a = data?.analytics;

  return (
    <section>
      <Header
        title="Telemetry Analytics"
        subtitle={`Live · ${settings.locationName} · ${settings.refreshMinutes}m refresh · Open-Meteo + USGS`}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Chart
          title="Air Quality (CO eq.)"
          unit="ppm"
          color="oklch(0.66 0.26 22)"
          value={a?.gasNow?.toFixed(1) ?? "—"}
          delta={a ? deltaOf(a.gas) : "—"}
          data={a?.gas ?? []}
        />
        <Chart
          title="Ambient Temperature"
          unit="°C"
          color="oklch(0.82 0.18 80)"
          value={a?.tempNow?.toFixed(1) ?? "—"}
          delta={a ? deltaOf(a.temp) : "—"}
          data={a?.temp ?? []}
        />
        <Chart
          title="Network Uptime"
          unit="%"
          color="oklch(0.78 0.16 210)"
          value={a?.uptimeNow?.toFixed(2) ?? "—"}
          delta={a ? deltaOf(a.uptime) : "—"}
          data={a?.uptime ?? []}
        />
      </div>
    </section>
  );
}
