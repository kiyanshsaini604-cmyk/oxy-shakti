import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ============================================================================
// Live intelligence feed — composes free public APIs (no keys required):
// - USGS earthquakes (GeoJSON):       https://earthquake.usgs.gov/
// - GDELT Doc 2.0 (news/conflict):    https://api.gdeltproject.org/api/v2/doc/
// - Open-Meteo weather + air quality: https://open-meteo.com/
// One server function returns the full panel pack so React Query can dedupe.
// ============================================================================

export type Threat = {
  id: string;
  title: string;
  category: "earthquake" | "weather" | "air" | "conflict" | "fire" | "other";
  severity: "low" | "medium" | "high" | "critical";
  place: string;
  url?: string;
  time: string; // ISO
  magnitude?: number;
};

export type Recommendation = {
  title: string;
  detail: string;
  confidence: number;
  tone: "critical" | "warning" | "cyan";
};

export type NetworkPoint = {
  x: number; // 0-100
  y: number;
  label: string;
  status: "safe" | "warning" | "critical";
};

export type IncidentLog = {
  id: string;
  source: string;
  time: string; // ISO
  hash: string;
  status: "Confirmed" | "Pending";
  url?: string;
};

export type AnalyticsSeries = {
  gas: number[];
  temp: number[];
  uptime: number[];
  gasNow: number;
  tempNow: number;
  uptimeNow: number;
};

export type IntelFeed = {
  threatScore: number; // 0-100
  threats: Threat[];
  recommendations: Recommendation[];
  network: NetworkPoint[];
  logs: IncidentLog[];
  analytics: AnalyticsSeries;
  trends: Threat[]; // global high-severity, for the optional trends panel
  generatedAt: string;
};

const Input = z.object({
  lat: z.number().default(30.7046),
  lon: z.number().default(76.7236),
  locationName: z.string().default("Mohali"),
});

// ---------- helpers ----------

function shortHash(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hex = h.toString(16).padStart(8, "0");
  return `0x${hex.slice(0, 4)}…${hex.slice(4, 8)}`;
}

function severityFromMag(mag: number): Threat["severity"] {
  if (mag >= 6) return "critical";
  if (mag >= 5) return "high";
  if (mag >= 4) return "medium";
  return "low";
}


// ---------- fetchers ----------

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "OxyShakti/1.0" } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

async function fetchEarthquakes(): Promise<Threat[]> {
  type USGS = {
    features: Array<{
      id: string;
      properties: { mag: number; place: string; time: number; url: string };
      geometry: { coordinates: [number, number, number] };
    }>;
  };
  const data = await safeJson<USGS>(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"
  );
  if (!data?.features) return [];
  return data.features.slice(0, 20).map((f) => ({
    id: f.id,
    title: `M${f.properties.mag.toFixed(1)} earthquake`,
    category: "earthquake" as const,
    severity: severityFromMag(f.properties.mag),
    place: f.properties.place,
    url: f.properties.url,
    time: new Date(f.properties.time).toISOString(),
    magnitude: f.properties.mag,
  }));
}

async function fetchConflictNews(): Promise<Threat[]> {
  type GDELT = {
    articles?: Array<{ url: string; title: string; seendate: string; sourcecountry: string; domain: string }>;
  };
  const q = encodeURIComponent("(war OR conflict OR strike OR attack OR explosion OR wildfire OR flood) sourcelang:eng");
  const data = await safeJson<GDELT>(
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&format=json&maxrecords=15&sort=datedesc`
  );
  if (!data?.articles) return [];
  return data.articles.map((a, i) => {
    const t = a.title.toLowerCase();
    const cat: Threat["category"] = t.includes("fire") || t.includes("wildfire") ? "fire"
      : t.includes("flood") || t.includes("storm") ? "weather"
      : "conflict";
    const sev: Threat["severity"] = /killed|dead|massacre|nuclear|invasion/.test(t) ? "critical"
      : /attack|explosion|strike|war/.test(t) ? "high"
      : "medium";
    // GDELT seendate format: YYYYMMDDTHHMMSSZ
    const iso = a.seendate
      ? `${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}T${a.seendate.slice(9, 11)}:${a.seendate.slice(11, 13)}:${a.seendate.slice(13, 15)}Z`
      : new Date().toISOString();
    return {
      id: `gdelt-${i}-${a.domain}`,
      title: a.title,
      category: cat,
      severity: sev,
      place: a.sourcecountry || a.domain,
      url: a.url,
      time: iso,
    };
  });
}

async function fetchWeatherSnapshot(lat: number, lon: number) {
  type W = { current?: { temperature_2m?: number; wind_speed_10m?: number; weather_code?: number }, hourly?: { temperature_2m?: number[] } };
  type A = { current?: { carbon_monoxide?: number; pm2_5?: number; ozone?: number } };
  const [w, a] = await Promise.all([
    safeJson<W>(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&hourly=temperature_2m&past_days=1&forecast_days=1`),
    safeJson<A>(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=carbon_monoxide,pm2_5,ozone`),
  ]);
  const temp = w?.current?.temperature_2m ?? 28;
  const wind = w?.current?.wind_speed_10m ?? 0;
  const co = a?.current?.carbon_monoxide ?? 0;
  const pm = a?.current?.pm2_5 ?? 0;
  const ozone = a?.current?.ozone ?? 0;
  const gasPpm = co / 1145 + pm * 0.02;
  const tempHistory = (w?.hourly?.temperature_2m ?? []).slice(-40);
  return { temp, wind, co, pm, ozone, gasPpm, tempHistory };
}

// ---------- compose ----------

export const getIntelFeed = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => Input.parse(input ?? {}))
  .handler(async ({ data }): Promise<IntelFeed> => {
    const [quakes, news, weather] = await Promise.all([
      fetchEarthquakes(),
      fetchConflictNews(),
      fetchWeatherSnapshot(data.lat, data.lon),
    ]);

    // Nearby quakes (currently using all from feed)
    const localQuakes = quakes;

    // Composite threat score
    const maxLocalMag = quakes.reduce((acc, q) => {
      // not all have coords on Threat; recompute via title — keep simple
      return Math.max(acc, q.magnitude ?? 0);
    }, 0);
    const airScore = Math.min(40, weather.gasPpm * 4 + weather.pm * 0.4);
    const tempScore = weather.temp > 45 ? 30 : weather.temp > 38 ? 20 : weather.temp > 33 ? 10 : 0;
    const quakeScore = Math.min(40, maxLocalMag * 5);
    const newsScore = Math.min(20, news.filter((n) => n.severity === "critical").length * 6 + news.filter((n) => n.severity === "high").length * 2);
    const threatScore = Math.max(8, Math.min(99, Math.round(airScore + tempScore + quakeScore + newsScore)));

    // Recommendations
    const recs: Recommendation[] = [];
    if (weather.gasPpm >= 5 || weather.pm >= 75) {
      recs.push({
        title: "Issue air-quality advisory",
        detail: `PM2.5 ${weather.pm.toFixed(0)} µg/m³ · CO ${weather.gasPpm.toFixed(1)} ppm in ${data.locationName}`,
        confidence: 94,
        tone: "warning",
      });
    }
    if (weather.temp > 38) {
      recs.push({
        title: "Heat-stress protocol for field teams",
        detail: `Ambient ${weather.temp.toFixed(1)}°C · hydration cycle 20 min`,
        confidence: 88,
        tone: "warning",
      });
    }
    if (maxLocalMag >= 5) {
      recs.push({
        title: "Activate seismic response node",
        detail: `M${maxLocalMag.toFixed(1)} event detected in feed · pre-stage SAR`,
        confidence: 96,
        tone: "critical",
      });
    }
    const criticalNews = news.find((n) => n.severity === "critical");
    if (criticalNews) {
      recs.push({
        title: "Monitor high-severity world event",
        detail: criticalNews.title.slice(0, 90),
        confidence: 82,
        tone: "cyan",
      });
    }
    if (recs.length === 0) {
      recs.push({
        title: "Operate at nominal posture",
        detail: `All inputs within bounds for ${data.locationName}`,
        confidence: 90,
        tone: "cyan",
      });
    }

    // Network points: 6 anchors around location with status driven by feed
    const baseStatus: NetworkPoint["status"] =
      threatScore >= 75 ? "critical" : threatScore >= 50 ? "warning" : "safe";
    const network: NetworkPoint[] = [
      { x: 22, y: 58, label: `${data.locationName.toUpperCase()}-N`, status: baseStatus },
      { x: 34, y: 44, label: `${data.locationName.toUpperCase()}-E`, status: weather.gasPpm > 5 ? "warning" : "safe" },
      { x: 48, y: 36, label: `${data.locationName.toUpperCase()}-S`, status: weather.temp > 40 ? "warning" : "safe" },
      { x: 62, y: 30, label: `${data.locationName.toUpperCase()}-W`, status: maxLocalMag >= 5 ? "critical" : "safe" },
      { x: 70, y: 50, label: "REGION-1", status: news.some((n) => n.severity === "critical") ? "warning" : "safe" },
      { x: 82, y: 62, label: "REGION-2", status: "safe" },
    ];

    // Logs: most recent quakes + top news as immutable-style entries
    const logs: IncidentLog[] = [
      ...quakes.slice(0, 3).map((q) => ({
        id: q.id,
        source: `USGS · ${q.title}`,
        time: q.time,
        hash: shortHash(q.id),
        status: "Confirmed" as const,
        url: q.url,
      })),
      ...news.slice(0, 4).map((n, i) => ({
        id: n.id,
        source: `${n.place} · ${n.title.slice(0, 48)}${n.title.length > 48 ? "…" : ""}`,
        time: n.time,
        hash: shortHash(n.id + i),
        status: "Confirmed" as const,
        url: n.url,
      })),
    ].sort((a, b) => +new Date(b.time) - +new Date(a.time));

    // Analytics — derive 40-pt series. Temp from open-meteo hourly; others synthesized off real now-values.
    const tempSeries = weather.tempHistory.length >= 10
      ? weather.tempHistory
      : Array.from({ length: 40 }, (_, i) => weather.temp + Math.sin(i / 3) * 2);
    const gasSeries = Array.from({ length: 40 }, (_, i) => Math.max(0, weather.gasPpm + Math.sin(i / 4) * 0.6 + (i / 40) * 0.4));
    const baselineUp = baseStatus === "critical" ? 96 : baseStatus === "warning" ? 98.5 : 99.92;
    const uptimeSeries = Array.from({ length: 40 }, (_, i) => baselineUp + Math.sin(i / 5) * 0.05);

    // Global trends: top 8 highest-severity items combined
    const trends = [...quakes, ...news]
      .sort((a, b) => {
        const order = { critical: 4, high: 3, medium: 2, low: 1 } as const;
        return order[b.severity] - order[a.severity] || +new Date(b.time) - +new Date(a.time);
      })
      .slice(0, 8);

    return {
      threatScore,
      threats: localQuakes.slice(0, 6),
      recommendations: recs.slice(0, 4),
      network,
      logs: logs.slice(0, 7),
      analytics: {
        gas: gasSeries,
        temp: tempSeries,
        uptime: uptimeSeries,
        gasNow: Math.round(weather.gasPpm * 10) / 10,
        tempNow: Math.round(weather.temp * 10) / 10,
        uptimeNow: Math.round(baselineUp * 100) / 100,
      },
      trends,
      generatedAt: new Date().toISOString(),
    };
  });
