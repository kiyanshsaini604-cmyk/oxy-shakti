import { useEffect, useState } from "react";
import { LayoutDashboard, Network, Siren, BrainCircuit, Boxes, BarChart3, Settings, Menu, X, Globe2 } from "lucide-react";
import { SettingsDialog } from "./SettingsDialog";
import { useSettings } from "@/lib/settings/settings-context";

type Item = { id: string; label: string; icon: typeof LayoutDashboard; badge?: number; isSettings?: boolean; conditional?: "trends" };

const baseItems: Item[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "nodes", label: "Nodes", icon: Network },
  { id: "alerts", label: "Emergency Alerts", icon: Siren, badge: 3 },
  { id: "ai", label: "AI Analysis", icon: BrainCircuit },
  { id: "trends", label: "Global Trends", icon: Globe2, conditional: "trends" },
  { id: "logs", label: "Incident Ledger", icon: Boxes },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings, isSettings: true },
];

export function Sidebar() {
  const { settings } = useSettings();
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const items = baseItems.filter((i) => !i.conditional || (i.conditional === "trends" && settings.showRealtimeTrends));

  useEffect(() => {
    const ids = items.filter((i) => !i.isSettings).map((i) => i.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [settings.showRealtimeTrends]);

  const handleClick = (it: Item) => {
    setMobileOpen(false);
    if (it.isSettings) {
      setSettingsOpen(true);
      return;
    }
    const el = document.getElementById(it.id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(it.id);
    }
  };

  const nav = (
    <nav className="flex-1 p-3 space-y-1">
      <p className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Operations</p>
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button
            key={it.label}
            onClick={() => handleClick(it)}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition relative cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-cyan-glow/15 to-transparent text-foreground border border-cyan-glow/25"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-cyan-glow shadow-[0_0_10px_var(--cyan-glow)]" />}
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-glow" : ""}`} />
            <span className="flex-1 text-left font-medium truncate">{it.label}</span>
            {it.badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-critical/15 text-critical border border-critical/30 shrink-0">
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="p-3 border-t border-panel-border/40">
      <div className="glass-panel p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-safe animate-blink-dot" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{settings.locationName}</span>
        </div>
        <p className="font-mono text-xs text-foreground">{settings.timezone}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{settings.refreshMinutes}m refresh · live</p>
      </div>
    </div>
  );

  return (
    <>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="md:hidden fixed bottom-4 left-4 z-40 h-11 w-11 rounded-full border border-cyan-glow/40 bg-background/80 backdrop-blur flex items-center justify-center text-cyan-glow glow-cyan cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-panel-border/60 bg-background/40 backdrop-blur-xl">
        {nav}
        {footer}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="relative flex flex-col w-64 max-w-[80vw] h-full bg-background border-r border-panel-border/60 animate-in slide-in-from-left">
            <div className="h-14 px-4 flex items-center justify-between border-b border-panel-border/40">
              <span className="font-display font-semibold text-foreground">Navigation</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"
                className="h-8 w-8 rounded-md border border-panel-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
