import { Flame, Sparkles } from "lucide-react";
import { useIntelFeed } from "@/lib/api/use-intel";
import { useSettings } from "@/lib/settings/settings-context";

export function ThreatMeter() {
  const { data, isFetching } = useIntelFeed();
  const { settings } = useSettings();
  const value = data?.threatScore ?? 0;
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const severity = value >= 75 ? "Severe" : value >= 50 ? "Elevated" : value >= 25 ? "Guarded" : "Low";
  const sevTone = value >= 75 ? "text-critical border-critical/40 bg-critical/10"
    : value >= 50 ? "text-warning border-warning/40 bg-warning/10"
    : "text-cyan-glow border-cyan-glow/40 bg-cyan-glow/10";

  const topThreat = data?.threats[0] ?? data?.trends[0];
  const aiNote = topThreat
    ? `${topThreat.title} — ${topThreat.place}`
    : `Composite of air, weather, seismic & news inputs for ${settings.locationName}`;

  return (
    <div className="glass-panel p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-foreground">Threat Analysis</h3>
        <span className={`text-[10px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded border ${sevTone}`}>
          {isFetching ? "Syncing" : severity}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Live composite · {settings.locationName} · {settings.refreshMinutes}m refresh
      </p>

      <div className="relative mx-auto my-5">
        <svg width="180" height="180" viewBox="0 0 180 180" className="rotate-[-90deg]">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.17 210)" />
              <stop offset="60%" stopColor="oklch(0.82 0.18 80)" />
              <stop offset="100%" stopColor="oklch(0.66 0.26 22)" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="90" r={r} stroke="oklch(0.3 0.02 250 / 0.5)" strokeWidth="10" fill="none" />
          <circle
            cx="90" cy="90" r={r}
            stroke="url(#g1)" strokeWidth="10" fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ filter: "drop-shadow(0 0 8px oklch(0.66 0.26 22 / 0.6))", transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold text-foreground tabular-nums">{value}<span className="text-xl text-critical">%</span></span>
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mt-1">Threat Level</span>
        </div>
      </div>

      <div className="rounded-lg border border-critical/30 bg-critical/5 p-3 flex gap-2">
        <Flame className="h-4 w-4 text-critical shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 text-critical font-medium mb-0.5">
            <Sparkles className="h-3 w-3" /> AI Assessment
          </div>
          <p className="text-foreground/90 line-clamp-2">{aiNote}</p>
        </div>
      </div>
    </div>
  );
}
