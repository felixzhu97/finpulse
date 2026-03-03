import type { AnalyticsEvent, AnalyticsTransport } from "../types";

export function createHttpTransport(baseUrl: string, source?: string): AnalyticsTransport {
  const url = baseUrl.replace(/\/$/, "") + "/analytics/events";
  return {
    track(event: AnalyticsEvent): void {
      const payload = {
        name: event.name,
        properties: { ...event.properties, ...(source && { source }) },
        timestamp: event.timestamp ?? Date.now(),
      };
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    },
  };
}
