import { Header } from "./NodeGrid";
import { useIntelFeed } from "@/lib/api/use-intel";
import { useSettings } from "@/lib/settings/settings-context";

const links: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 4], [0, 5]];

const tone = (s: string) => s === "critical" ? "oklch(0.66 0.26 22)" : s === "warning" ? "oklch(0.82 0.18 80)" : "oklch(0.78 0.16 210)";

export function NetworkMap() {
  const { data } = useIntelFeed();
  const { settings } = useSettings();
  const points = data?.network ?? [];
  const anomalies = points.filter((p) => p.status !== "safe").length;

  return (
    <section className="glass-panel p-5">
      <Header
        title={`${settings.locationName} Sector Network`}
        subtitle={`${points.length} nodes online · ${anomalies} anomalies · live grid`}
        action={
          <div className="flex gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
            <Legend color="bg-safe" label="Safe" />
            <Legend color="bg-warning" label="Warn" />
            <Legend color="bg-critical" label="Crit" />
          </div>
        }
      />
      <div className="relative aspect-[16/7] rounded-lg overflow-hidden border border-panel-border/40 bg-background/60 grid-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/5 via-transparent to-critical/5" />
        <svg viewBox="0 0 100 70" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {links.map(([a, b], i) => points[a] && points[b] && (
            <line key={i}
              x1={points[a].x} y1={points[a].y}
              x2={points[b].x} y2={points[b].y}
              stroke="oklch(0.78 0.16 210 / 0.4)" strokeWidth="0.15"
              strokeDasharray="0.6 0.6"
            />
          ))}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="1.6" fill={tone(p.status)} opacity="0.18" />
              <circle cx={p.x} cy={p.y} r="0.6" fill={tone(p.status)}>
                <animate attributeName="r" values="0.6;1.1;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
        {points.map((p, i) => (
          <span key={i}
            className="absolute text-[9px] font-mono text-foreground/70 -translate-x-1/2 translate-y-2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            {p.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />{label}
    </span>
  );
}
