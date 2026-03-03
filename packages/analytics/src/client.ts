import merge from "lodash/merge";
import type {
  AnalyticsClient,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsTransport,
  EventProperties,
  UserTraits,
} from "./types";

function createAnalyticsClient(transport: AnalyticsTransport): AnalyticsClient {
  let currentUserId: string | null = null;
  let currentTraits: UserTraits = {};

  return {
    track(name: AnalyticsEventName, properties?: EventProperties): void {
      const base: EventProperties = currentUserId
        ? { ...currentTraits, userId: currentUserId }
        : { ...currentTraits };
      const event: AnalyticsEvent = {
        name,
        properties: merge({}, base, properties),
        timestamp: Date.now(),
      };
      transport.track(event);
    },
    identify(userId: string, traits?: UserTraits): void {
      currentUserId = userId;
      if (traits) {
        currentTraits = merge({}, currentTraits, traits);
      }
    },
  };
}

function createNoopClient(): AnalyticsClient {
  return {
    track: () => {},
    identify: () => {},
  };
}

export { createAnalyticsClient, createNoopClient };
