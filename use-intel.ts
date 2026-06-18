import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIntelFeed, type IntelFeed } from "./intel.functions";
import { useSettings } from "@/lib/settings/settings-context";

export function useIntelFeed() {
  const { settings, refreshMs } = useSettings();
  const fetchFn = useServerFn(getIntelFeed);
  return useQuery<IntelFeed>({
    queryKey: ["intel-feed", settings.lat, settings.lon, settings.locationName],
    queryFn: () => fetchFn({ data: { lat: settings.lat, lon: settings.lon, locationName: settings.locationName } }),
    refetchInterval: refreshMs,
    staleTime: refreshMs,
    refetchOnWindowFocus: false,
  });
}
