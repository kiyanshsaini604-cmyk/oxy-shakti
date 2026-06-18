import { Boxes, ExternalLink } from "lucide-react";
import { Header } from "./NodeGrid";
import { useIntelFeed } from "@/lib/api/use-intel";
import { useSettings } from "@/lib/settings/settings-context";

export function BlockchainLogs() {
  const { data, isFetching } = useIntelFeed();
  const { formatTime, settings } = useSettings();
  const logs = data?.logs ?? [];

  return (
    <section className="glass-panel p-5">
      <Header
        title="Verified Incident Ledger"
        subtitle={`Immutable feed · USGS + GDELT · ${settings.refreshMinutes}m refresh`}
        action={
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-cyan-glow">
            <Boxes className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /> Sui · Mainnet
          </span>
        }
      />
      <div className="overflow-x-auto rounded-lg border border-panel-border/40">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-background/60">
            <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="text-left px-3 py-2 font-medium">Source · Incident</th>
              <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Timestamp</th>
              <th className="text-left px-3 py-2 font-medium">Tx Hash</th>
              <th className="text-right px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">Syncing live feed…</td></tr>
            )}
            {logs.map((l, i) => (
              <tr key={l.id} className={`border-t border-panel-border/30 ${i === 0 ? "bg-cyan-glow/5" : ""}`}>
                <td className="px-3 py-2.5 text-foreground max-w-[360px] truncate" title={l.source}>{l.source}</td>
                <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{formatTime(l.time)}</td>
                <td className="px-3 py-2.5">
                  {l.url ? (
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-glow hover:underline">
                      {l.hash} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-cyan-glow">{l.hash}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-safe">
                    <span className="h-1.5 w-1.5 rounded-full bg-safe" /> {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-3">
        Stored on Sui Blockchain · finalized · {logs.length} entries
      </p>
    </section>
  );
}
