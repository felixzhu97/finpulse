import { describe, it, expect } from "vitest";
import type {
  AnalyticsEventName,
  EventProperties,
  UserTraits,
  AnalyticsEvent,
  AnalyticsClient,
  AnalyticsTransport,
  GrowthBookConfig,
} from "./types";

describe("types", () => {
  describe("AnalyticsEventName", () => {
    it("should be a string type", () => {
      const name: AnalyticsEventName = "page_view";
      expect(typeof name).toBe("string");
    });

    it("should accept any string value", () => {
      const name: AnalyticsEventName = "custom_event";
      expect(name).toBe("custom_event");
    });
  });

  describe("EventProperties", () => {
    it("should accept string values", () => {
      const props: EventProperties = { key: "value" };
      expect(props.key).toBe("value");
    });

    it("should accept number values", () => {
      const props: EventProperties = { count: 42 };
      expect(props.count).toBe(42);
    });

    it("should accept boolean values", () => {
      const props: EventProperties = { active: true };
      expect(props.active).toBe(true);
    });

    it("should accept undefined values", () => {
      const props: EventProperties = { optional: undefined };
      expect(props.optional).toBeUndefined();
    });

    it("should accept mixed value types", () => {
      const props: EventProperties = {
        name: "test",
        count: 10,
        enabled: false,
        optional: undefined,
      };
      expect(props.name).toBe("test");
      expect(props.count).toBe(10);
      expect(props.enabled).toBe(false);
      expect(props.optional).toBeUndefined();
    });
  });

  describe("UserTraits", () => {
    it("should accept string values", () => {
      const traits: UserTraits = { email: "test@example.com" };
      expect(traits.email).toBe("test@example.com");
    });

    it("should accept number values", () => {
      const traits: UserTraits = { age: 25 };
      expect(traits.age).toBe(25);
    });

    it("should accept boolean values", () => {
      const traits: UserTraits = { premium: true };
      expect(traits.premium).toBe(true);
    });

    it("should accept mixed value types", () => {
      const traits: UserTraits = {
        name: "John",
        age: 30,
        isAdmin: false,
      };
      expect(traits.name).toBe("John");
      expect(traits.age).toBe(30);
      expect(traits.isAdmin).toBe(false);
    });
  });

  describe("AnalyticsEvent", () => {
    it("should accept event with name only", () => {
      const event: AnalyticsEvent = { name: "page_view" };
      expect(event.name).toBe("page_view");
    });

    it("should accept event with name and properties", () => {
      const event: AnalyticsEvent = {
        name: "page_view",
        properties: { page: "home" },
      };
      expect(event.name).toBe("page_view");
      expect(event.properties?.page).toBe("home");
    });

    it("should accept event with name and timestamp", () => {
      const timestamp = 1699999999999;
      const event: AnalyticsEvent = {
        name: "page_view",
        timestamp,
      };
      expect(event.name).toBe("page_view");
      expect(event.timestamp).toBe(timestamp);
    });

    it("should accept complete event structure", () => {
      const event: AnalyticsEvent = {
        name: "purchase",
        properties: { amount: 100, currency: "USD" },
        timestamp: 1699999999999,
      };
      expect(event.name).toBe("purchase");
      expect(event.properties?.amount).toBe(100);
      expect(event.properties?.currency).toBe("USD");
      expect(event.timestamp).toBe(1699999999999);
    });
  });

  describe("AnalyticsClient", () => {
    it("should have required track method", () => {
      const client: AnalyticsClient = {
        track: (name) => expect(name).toBe("test"),
      };
      client.track("test");
    });

    it("should have required identify method", () => {
      const client: AnalyticsClient = {
        track: () => {},
        identify: (userId) => expect(userId).toBe("user-123"),
      };
      client.identify("user-123");
    });

    it("should have optional flush method", () => {
      const client: AnalyticsClient = {
        track: () => {},
        identify: () => {},
        flush: async () => {},
      };
      expect(typeof client.flush).toBe("function");
    });

    it("should work without flush method", () => {
      const client: AnalyticsClient = {
        track: () => {},
        identify: () => {},
      };
      expect(client.flush).toBeUndefined();
    });
  });

  describe("AnalyticsTransport", () => {
    it("should have required track method", () => {
      const transport: AnalyticsTransport = {
        track: (event) => expect(event.name).toBe("test"),
      };
      transport.track({ name: "test" });
    });

    it("should allow sync track implementation", () => {
      const events: AnalyticsEvent[] = [];
      const transport: AnalyticsTransport = {
        track: (event) => events.push(event),
      };
      transport.track({ name: "event1" });
      transport.track({ name: "event2" });
      expect(events).toHaveLength(2);
    });

    it("should allow async track implementation", () => {
      const transport: AnalyticsTransport = {
        track: async (event) => {
          await Promise.resolve();
          return event;
        },
      };
      expect(transport.track({ name: "test" })).toBeInstanceOf(Promise);
    });
  });

  describe("GrowthBookConfig", () => {
    it("should require apiHost", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-key",
      };
      expect(config.apiHost).toBe("https://cdn.growthbook.io");
    });

    it("should require clientKey", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-key",
      };
      expect(config.clientKey).toBe("sdk-key");
    });

    it("should have optional enableDevMode", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-key",
        enableDevMode: true,
      };
      expect(config.enableDevMode).toBe(true);
    });

    it("should have optional attributes", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-key",
        attributes: { browser: "chrome" },
      };
      expect(config.attributes).toEqual({ browser: "chrome" });
    });
  });
});
