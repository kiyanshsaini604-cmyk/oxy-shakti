import { BrainCircuit, ArrowRight, ShieldAlert, Radio, Zap, Loader2 } from "lucide-react";
import { useIntelFeed } from "@/lib/api/use-intel";
import { useSettings } from "@/lib/settings/settings-context";

const toneMap = {
  critical: "text-critical border-critical/40 bg-critical/10",
  warning: "text-warning border-warning/40 bg-warning/10",
  cyan: "text-cyan-glow border-cyan-glow/40 bg-cyan-glow/10",
};

const iconForTone = { critical: ShieldAlert, warning: Radio, cyan: Zap } as const;

export function AIRecommendations() {
  const { data, isFetching } = useIntelFeed();
  const { settings } = useSettings();
  const recs = data?.recommendations ?? [];

  return (
    <div className="glass-panel p-5 h-full">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-cyan-glow" /> AI Recommendations
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1">
          {isFetching && <Loader2 className="h-3 w-3 animate-spin" />} Shakti-AI v4.2
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Live plan for {settings.locationName} · re-ranked every {settings.refreshMinutes}m
      </p>

      <ul className="space-y-2.5">
        {recs.length === 0 && (
          <li className="text-xs text-muted-foreground py-4 text-center">Syncing live feed…</li>
        )}
        {recs.map((r, i) => {
          const Icon = iconForTone[r.tone];
          return (
            <li key={`${r.title}-${i}`} className="group rounded-lg border border-panel-border/50 bg-background/40 p-3 hover:border-cyan-glow/40 transition">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-md border flex items-center justify-center ${toneMap[r.tone]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <span className="font-mono text-[10px] text-cyan-glow">{r.confidence}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.detail}</p>
                  <div className="mt-2 h-1 rounded-full bg-background overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-glow to-primary" style={{ width: `${r.confidence}%` }} />
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-glow transition" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
