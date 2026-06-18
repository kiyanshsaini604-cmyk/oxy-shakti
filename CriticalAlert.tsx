import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CriticalAlert() {
  const [acked, setAcked] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-critical/40 glow-red">
      <div className="absolute inset-0 bg-gradient-to-r from-critical/25 via-critical/10 to-transparent" />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-critical/30 blur-3xl" />
      <div className="absolute inset-y-0 right-0 w-1/3 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-critical to-transparent animate-scan" />
      </div>

      <div className="relative p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-critical/15 border border-critical/50 flex items-center justify-center animate-pulse-ring">
              <AlertTriangle className="h-6 w-6 text-critical" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-critical px-1.5 py-0.5 rounded border border-critical/40 bg-critical/10">P1 · Critical</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">ALERT #A-2049</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground">
              CRITICAL ALERT DETECTED
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              High gas concentration detected in <span className="text-foreground font-medium">Sector 82 IT City · Tower B3</span>
            </p>
          </div>
        </div>

        <div className="md:ml-auto grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <Stat icon={<MapPin className="h-3.5 w-3.5" />} label="Origin" value="NODE-82" />
          <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Detected" value="14s ago" />
          <a
            href="https://cpcb.nic.in/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.success("Dispatching response", { description: "Routing to A-PAG partner desk." })}
            className="col-span-2 h-10 px-4 rounded-md bg-critical text-white font-medium text-sm hover:bg-critical/90 transition glow-red inline-flex items-center justify-center cursor-pointer"
          >
            Report Pollution
          </a>
          <button
            type="button"
            disabled={acked}
            onClick={() => {
              setAcked(true);
              toast("Alert A-2049 acknowledged", { description: "Operator log updated · escalation paused." });
            }}
            className="col-span-2 h-10 px-4 rounded-md border border-panel-border/80 text-foreground hover:border-cyan-glow/50 transition text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {acked ? "Acknowledged ✓" : "Acknowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-3 py-2 rounded-md bg-background/60 border border-panel-border/60">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono text-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}
