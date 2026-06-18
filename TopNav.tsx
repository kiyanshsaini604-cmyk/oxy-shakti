import { Bell, Wallet, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function TopNav() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString("en-GB", { hour12: false });
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-panel-border/60 backdrop-blur-xl bg-background/60">
      <div className="h-full px-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-md flex items-center justify-center glow-cyan bg-gradient-to-br from-cyan-glow/30 to-primary/10">
            <span className="font-display font-bold text-cyan-glow text-glow-cyan">O</span>
            <span className="absolute -inset-px rounded-md ring-1 ring-cyan-glow/30 pointer-events-none" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-semibold tracking-tight text-foreground">Oxy Shakti</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Emergency Intel · v2.6</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-safe/30 bg-safe/5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-safe animate-blink-dot" />
            <span className="absolute inset-0 rounded-full bg-safe/40 blur-[3px]" />
          </span>
          <Activity className="h-3.5 w-3.5 text-safe" />
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-safe">System Active</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end leading-tight">
            <span className="font-mono text-sm text-foreground tabular-nums">{time}</span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{date} · UTC</span>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => toast("3 active alerts", { description: "A-2049 critical · A-2048, A-2047 confirmed." })}
            className="relative h-9 w-9 rounded-md border border-panel-border/60 hover:border-cyan-glow/40 transition flex items-center justify-center text-muted-foreground hover:text-cyan-glow cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-critical animate-blink-dot" />
          </button>
          <button
            type="button"
            aria-label="Operator wallet"
            onClick={() => {
              navigator.clipboard?.writeText("0x7Fa9...A2E1").catch(() => {});
              toast.success("Wallet address copied", { description: "0x7Fa9…A2E1 · Sui Mainnet" });
            }}
            className="h-9 px-2.5 sm:px-3 rounded-md flex items-center gap-2 bg-gradient-to-r from-primary/20 to-cyan-glow/10 border border-cyan-glow/30 hover:border-cyan-glow/60 transition glow-cyan cursor-pointer"
          >
            <Wallet className="h-4 w-4 text-cyan-glow" />
            <span className="hidden sm:inline font-mono text-xs text-foreground">0x7F…A2E1</span>
          </button>
        </div>
      </div>
    </header>
  );
}
