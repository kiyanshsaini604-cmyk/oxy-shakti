import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useSettings, LOCATION_PRESETS } from "@/lib/settings/settings-context";
import { toast } from "sonner";

export function SettingsDialog({ children, open, onOpenChange }: { children?: ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const { settings, update, setLocationPreset } = useSettings();
  const [customLat, setCustomLat] = useState(String(settings.lat));
  const [customLon, setCustomLon] = useState(String(settings.lon));
  const [customName, setCustomName] = useState(settings.locationName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-background border-panel-border/60">
        <DialogHeader>
          <DialogTitle className="font-display">Operator Settings</DialogTitle>
          <DialogDescription className="text-xs">
            All telemetry, threats, and trends refresh on this cadence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Location preset */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Location preset</label>
            <div className="grid grid-cols-2 gap-2">
              {LOCATION_PRESETS.map((p) => {
                const active = p.name === settings.locationName;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setLocationPreset(p)}
                    className={`px-3 py-2 rounded-md text-xs text-left border transition cursor-pointer ${
                      active ? "border-cyan-glow/60 bg-cyan-glow/10 text-foreground" : "border-panel-border/50 text-muted-foreground hover:border-cyan-glow/30"
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="font-mono text-[10px] opacity-70">{p.tz}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom coords */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Custom coordinates</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Name"
                className="px-2 py-2 rounded-md bg-background border border-panel-border/50 text-sm focus:outline-none focus:border-cyan-glow/50"
              />
              <input
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                placeholder="Lat"
                inputMode="decimal"
                className="px-2 py-2 rounded-md bg-background border border-panel-border/50 text-sm font-mono focus:outline-none focus:border-cyan-glow/50"
              />
              <input
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value)}
                placeholder="Lon"
                inputMode="decimal"
                className="px-2 py-2 rounded-md bg-background border border-panel-border/50 text-sm font-mono focus:outline-none focus:border-cyan-glow/50"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const lat = parseFloat(customLat);
                const lon = parseFloat(customLon);
                if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                  toast.error("Invalid coordinates");
                  return;
                }
                update({ locationName: customName || "Custom", lat, lon });
                toast.success(`Location set to ${customName || "Custom"}`);
              }}
              className="mt-2 px-3 py-1.5 rounded-md border border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow text-xs hover:bg-cyan-glow/15 cursor-pointer"
            >
              Apply coordinates
            </button>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => update({ timezone: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-panel-border/50 text-sm focus:outline-none focus:border-cyan-glow/50 cursor-pointer"
            >
              {["Asia/Kolkata","Europe/London","Europe/Berlin","Europe/Paris","America/New_York","America/Los_Angeles","Asia/Tokyo","Asia/Singapore","Australia/Sydney","UTC"].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Refresh interval */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Refresh interval — {settings.refreshMinutes} min
            </label>
            <div className="flex gap-2">
              {[1, 5, 10, 15, 30].map((m) => {
                const active = settings.refreshMinutes === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => update({ refreshMinutes: m })}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs border transition cursor-pointer ${
                      active ? "border-cyan-glow/60 bg-cyan-glow/10 text-cyan-glow" : "border-panel-border/50 text-muted-foreground hover:border-cyan-glow/30"
                    }`}
                  >
                    {m}m
                  </button>
                );
              })}
            </div>
          </div>

          {/* Realtime trends toggle */}
          <div className="flex items-start justify-between gap-4 rounded-md border border-panel-border/50 p-3">
            <div>
              <div className="text-sm font-medium text-foreground">Real-time global trends</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show a live feed of worldwide high-severity events (earthquakes, conflict, calamities). Off by default.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.showRealtimeTrends}
              onClick={() => update({ showRealtimeTrends: !settings.showRealtimeTrends })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition ${
                settings.showRealtimeTrends ? "bg-cyan-glow/30 border-cyan-glow/60" : "bg-background border-panel-border/60"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition ${
                  settings.showRealtimeTrends ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
