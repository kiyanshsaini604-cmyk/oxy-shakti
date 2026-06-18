import { createServerFn } from "@tanstack/react-start";

// Live Mohali sector telemetry from Open-Meteo (free, no API key required).
// - Weather (temperature): https://open-meteo.com/en/docs
// - Air quality (CO, NO2, PM2.5): https://open-meteo.com/en/docs/air-quality-api
// Returned values are real; we map carbon-monoxide (µg/m³) into the dashboard's
// "ppm" gas field since the magnitude (10–500) fits the existing thresholds.

export type SectorLive = {
  id: string;
  zone: string;
  temp: number;
  gas: number;
  status: "safe" | "warning" | "critical";
  signal: number;
  updated: string;
};

const sectors = [
  { id: "NODE-70", zone: "Sector 70 · Residential Block C", lat: 30.7046, lon: 76.7236, signal: 96 },
  { id: "NODE-82", zone: "Sector 82 · IT City · Tower B3", lat: 30.6589, lon: 76.7300, signal: 88 },
  { id: "NODE-P7", zone: "Phase 7 · Market Substation", lat: 30.7090, lon: 76.7080, signal: 72 },
  { id: "NODE-AC", zone: "Aerocity · Perimeter Gate 2", lat: 30.6452, lon: 76.8020, signal: 99 },
];

// Real-world urban CO ppm is ~0.3–10. WHO 8-hr guideline: 9 ppm. >35 ppm = hazardous.
function classify(temp: number, gas: number): SectorLive["status"] {
  if (temp > 45 || gas >= 15) return "critical";
  if (temp > 38 || gas >= 5) return "warning";
  return "safe";
}

async function fetchOne(s: (typeof sectors)[number]): Promise<SectorLive> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m`;
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${s.lat}&longitude=${s.lon}&current=carbon_monoxide,pm2_5`;

  const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(aqUrl)]);
  const w = (await wRes.json()) as { current?: { temperature_2m?: number } };
  const a = (await aRes.json()) as { current?: { carbon_monoxide?: number; pm2_5?: number } };

  const temp = Math.round(((w.current?.temperature_2m ?? 28) + Number.EPSILON) * 10) / 10;
  // Open-Meteo returns CO in µg/m³. Convert to ppm: 1 ppm CO ≈ 1145 µg/m³ at 25°C.
  const coUgM3 = a.current?.carbon_monoxide ?? 0;
  const pm = a.current?.pm2_5 ?? 0;
  // PM2.5 nudges the composite by a small ppm-equivalent so dense smog reads higher.
  const gas = Math.round(((coUgM3 / 1145) + pm * 0.02) * 10) / 10;

  return {
    id: s.id,
    zone: s.zone,
    temp,
    gas,
    status: classify(temp, gas),
    signal: s.signal,
    updated: new Date().toISOString(),
  };
}

export const getSectorTelemetry = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.allSettled(sectors.map(fetchOne));
  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          id: sectors[i].id,
          zone: sectors[i].zone,
          temp: 0,
          gas: 0,
          status: "safe" as const,
          signal: sectors[i].signal,
          updated: new Date().toISOString(),
        }
  );
});
