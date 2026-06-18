import { Globe2, ExternalLink, AlertOctagon } from "lucide-react";
import { Header } from "./NodeGrid";
import { useIntelFeed } from "@/lib/api/use-intel";
import { useSettings } from "@/lib/settings/settings-context";

const sevTone: Record<string, string> = {
  critical: "text-critical border-critical/40 bg-critical/10",
  high: "text-warning border-warning/40 bg-warning/10",
  medium: "text-cyan-glow border-cyan-glow/40 bg-cyan-glow/10",
  low: "text-muted-foreground border-panel-border/50 bg-background/40",
};

export function RealtimeTrends() {
  const { data, isFetching, dataUpdatedAt } = useIntelFeed();
  const { formatTime, settings } = useSettings();
  const trends = data?.trends ?? [];
  const sync = dataUpdatedAt ? formatTime(new Date(dataUpdatedAt).toISOString()) : "—";

  return (
    <section id="trends" className="scroll-mt-24 glass-panel p-5">
      <Header
        title="Real-time Global Trends"
        subtitle={`Live worldwide events · synced ${sync} · ${settings.refreshMinutes}m cycle`}
        action={
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-cyan-glow">
            <Globe2 className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /> {isFetching ? "Syncing" : "Live"}
          </span>
        }
      />
      {trends.length === 0 && (
        <p className="text-xs text-muted-foreground py-6 text-center">No live items in feed. Will retry on next cycle.</p>
      )}
      <ul className="space-y-2">
        {trends.map((t) => (
          <li key={t.id} className="rounded-lg border border-panel-border/50 bg-background/40 p-3 flex items-start gap-3 hover:border-cyan-glow/40 transition">
            <div className={`h-9 w-9 rounded-md border flex items-center justify-center ${sevTone[t.severity]}`}>
              <AlertOctagon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border ${sevTone[t.severity]}`}>
                  {t.severity}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{t.category}</span>
                <span className="text-[10px] font-mono text-muted-foreground ml-auto">{formatTime(t.time)}</span>
              </div>
              <p className="text-sm text-foreground mt-1 line-clamp-2">{t.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.place}</p>
            </div>
            {t.url && (
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-cyan-glow shrink-0 mt-1" aria-label="Open source">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
