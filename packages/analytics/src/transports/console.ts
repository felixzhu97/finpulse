import type { AnalyticsTransport } from "../types";

export function createConsoleTransport(): AnalyticsTransport {
  return {
    track(event) {
      if (typeof console !== "undefined" && console.info) {
        console.info("[analytics]", event.name, event.properties ?? {});
      }
    },
  };
}
