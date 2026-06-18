import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/oxy/TopNav";
import { Sidebar } from "@/components/oxy/Sidebar";
import { CriticalAlert } from "@/components/oxy/CriticalAlert";
import { NodeGrid } from "@/components/oxy/NodeGrid";
import { ThreatMeter } from "@/components/oxy/ThreatMeter";
import { NetworkMap } from "@/components/oxy/NetworkMap";
import { BlockchainLogs } from "@/components/oxy/BlockchainLogs";
import { AIRecommendations } from "@/components/oxy/AIRecommendations";
import { Analytics } from "@/components/oxy/Analytics";
import { RealtimeTrends } from "@/components/oxy/RealtimeTrends";
import { useSettings } from "@/lib/settings/settings-context";
import { useIntelFeed } from "@/lib/api/use-intel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oxy Shakti — Emergency Intelligence Command Center" },
      { name: "description", content: "AI + IoT + Blockchain emergency intelligence dashboard for real-time threat detection, node monitoring, and immutable response logs." },
      { property: "og:title", content: "Oxy Shakti — Emergency Intelligence" },
      { property: "og:description", content: "Real-time emergency intelligence command center." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { settings } = useSettings();
  return (
    <div className="min-h-screen">
      <TopNav />
      <Ticker />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
          <h1 className="sr-only">Oxy Shakti Emergency Intelligence Dashboard</h1>
          <div id="dashboard" className="scroll-mt-24"><CriticalAlert /></div>
          {settings.showRealtimeTrends && <RealtimeTrends />}
          <div id="alerts" className="scroll-mt-24"><NodeGrid /></div>
          <div id="ai" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><ThreatMeter /></div>
            <div className="lg:col-span-2"><AIRecommendations /></div>
          </div>
          <NetworkMap />
          <div id="logs" className="scroll-mt-24 grid grid-cols-1 gap-6">
            <BlockchainLogs />
          </div>
          <div id="analytics" className="scroll-mt-24"><Analytics /></div>
          <footer className="pt-6 pb-4 text-center text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Oxy Shakti · Emergency Intelligence Network · Powered by Sui & Shakti-AI
          </footer>
        </main>
      </div>
    </div>
  );
}

function Ticker() {
  const { data } = useIntelFeed();
  const items = data
    ? [
        `THREAT LEVEL ${data.threatScore}% · live composite`,
        ...data.trends.slice(0, 3).map((t) => `${t.severity.toUpperCase()} · ${t.title.slice(0, 60)}`),
        `${data.logs.length} verified incidents in feed`,
      ]
    : ["Syncing live intelligence feed…"];
  const line = items.join("   ◆   ");
  return (
    <div className="h-7 border-b border-panel-border/40 bg-background/60 overflow-hidden flex items-center">
      <div className="flex whitespace-nowrap animate-ticker font-mono text-[11px] text-muted-foreground">
        <span className="px-6">{line}</span>
        <span className="px-6">{line}</span>
      </div>
    </div>
  );
}
