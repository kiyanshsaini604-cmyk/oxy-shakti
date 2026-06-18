import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocationPreset = { name: string; lat: number; lon: number; tz: string };

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: "Mohali", lat: 30.7046, lon: 76.7236, tz: "Asia/Kolkata" },
  { name: "Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
  { name: "Mumbai", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  { name: "London", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { name: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
];

export type Settings = {
  locationName: string;
  lat: number;
  lon: number;
  timezone: string;
  refreshMinutes: number;
  showRealtimeTrends: boolean;
};

const DEFAULT: Settings = {
  locationName: "Mohali",
  lat: 30.7046,
  lon: 76.7236,
  timezone: "Asia/Kolkata",
  refreshMinutes: 5,
  showRealtimeTrends: false,
};

const KEY = "oxy-shakti-settings.v1";

type Ctx = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  setLocationPreset: (preset: LocationPreset) => void;
  refreshMs: number;
  formatTime: (iso: string) => string;
};

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const value = useMemo<Ctx>(() => {
    const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
    return {
      settings,
      update,
      setLocationPreset: (p) =>
        setSettings((s) => ({ ...s, locationName: p.name, lat: p.lat, lon: p.lon, timezone: p.tz })),
      refreshMs: Math.max(1, settings.refreshMinutes) * 60 * 1000,
      formatTime: (iso: string) => {
        try {
          return new Date(iso).toLocaleTimeString(undefined, {
            timeZone: settings.timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        } catch {
          return new Date(iso).toLocaleTimeString();
        }
      },
    };
  }, [settings]);

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings(): Ctx {
  const c = useContext(SettingsCtx);
  if (!c) throw new Error("useSettings must be used within SettingsProvider");
  return c;
}
