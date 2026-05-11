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

// =============================================================================
// Domain Test Values - Analytics Types
// =============================================================================

const TYPE_DOMAIN = {
  ANALYTICS_EVENT_NAME: {
    VALID: ["page_view", "custom_event", "cta_click", "login", "logout"],
    PATTERN: /^[a-z_]+$/,
  } as const,

  EVENT_PROPERTIES: {
    STRING: { key: "value", name: "test", email: "user@example.com" },
    NUMBER: { count: 42, amount: 99.99, quantity: 5 },
    BOOLEAN: { active: true, enabled: false, premium: true },
    UNDEFINED: { optional: undefined },
    MIXED: { name: "test", count: 10, enabled: false, optional: undefined },
  } as const,

  USER_TRAITS: {
    STRING: { email: "test@example.com", name: "John" },
    NUMBER: { age: 25, accountAge: 365 },
    BOOLEAN: { premium: true, verified: false },
    MIXED: { name: "John", age: 30, isAdmin: false },
  } as const,

  ANALYTICS_EVENT: {
    MINIMAL: { name: "page_view" },
    WITH_PROPERTIES: { name: "page_view", properties: { page: "home" } },
    WITH_TIMESTAMP: { name: "page_view", timestamp: 1699999999999 },
    COMPLETE: {
      name: "purchase",
      properties: { amount: 100, currency: "USD" },
      timestamp: 1699999999999,
    },
  } as const,

  BOUNDARY: {
    EMPTY_STRING: "",
    MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  } as const,
} as const;

// =============================================================================
// Test Suite
// =============================================================================

describe("types", () => {
  describe("AnalyticsEventName", () => {
    it.each(TYPE_DOMAIN.ANALYTICS_EVENT_NAME.VALID)(
      "should accept valid event name: %s",
      (name) => {
        const eventName: AnalyticsEventName = name;
        expect(typeof eventName).toBe("string");
        expect(eventName).toMatch(TYPE_DOMAIN.ANALYTICS_EVENT_NAME.PATTERN);
      }
    );

    it("should accept any string value conforming to pattern", () => {
      const name: AnalyticsEventName = "custom_event";
      expect(name).toBe("custom_event");
    });
  });

  describe("EventProperties", () => {
    it.each([
      { input: TYPE_DOMAIN.EVENT_PROPERTIES.STRING, expected: "value" },
      { input: TYPE_DOMAIN.EVENT_PROPERTIES.NUMBER, expected: 42 },
      { input: TYPE_DOMAIN.EVENT_PROPERTIES.BOOLEAN, expected: true },
      { input: TYPE_DOMAIN.EVENT_PROPERTIES.UNDEFINED, expected: undefined },
    ])("should accept $expected type values", ({ input, expected }) => {
      const props: EventProperties = input;
      const firstKey = Object.keys(input)[0];
      expect((props as any)[firstKey]).toBe(expected);
    });

    it("should accept mixed value types", () => {
      const props: EventProperties = TYPE_DOMAIN.EVENT_PROPERTIES.MIXED;
      expect(props.name).toBe("test");
      expect(props.count).toBe(10);
      expect(props.enabled).toBe(false);
      expect(props.optional).toBeUndefined();
    });
  });

  describe("UserTraits", () => {
    it.each([
      { input: TYPE_DOMAIN.USER_TRAITS.STRING, field: "email" },
      { input: TYPE_DOMAIN.USER_TRAITS.NUMBER, field: "age" },
      { input: TYPE_DOMAIN.USER_TRAITS.BOOLEAN, field: "premium" },
    ])("should accept $field type values", ({ input, field }) => {
      const traits: UserTraits = input;
      expect((traits as any)[field]).toBeDefined();
    });

    it("should accept mixed value types", () => {
      const traits: UserTraits = TYPE_DOMAIN.USER_TRAITS.MIXED;
      expect(traits.name).toBe("John");
      expect(traits.age).toBe(30);
      expect(traits.isAdmin).toBe(false);
    });
  });

  describe("AnalyticsEvent", () => {
    it("should accept event with name only", () => {
      const event: AnalyticsEvent = TYPE_DOMAIN.ANALYTICS_EVENT.MINIMAL;
      expect(event.name).toBe("page_view");
    });

    it("should accept event with name and properties", () => {
      const event: AnalyticsEvent = TYPE_DOMAIN.ANALYTICS_EVENT.WITH_PROPERTIES;
      expect(event.name).toBe("page_view");
      expect(event.properties?.page).toBe("home");
    });

    it("should accept event with name and timestamp", () => {
      const event: AnalyticsEvent = TYPE_DOMAIN.ANALYTICS_EVENT.WITH_TIMESTAMP;
      expect(event.name).toBe("page_view");
      expect(event.timestamp).toBe(1699999999999);
    });

    it("should accept complete event structure", () => {
      const event: AnalyticsEvent = TYPE_DOMAIN.ANALYTICS_EVENT.COMPLETE;
      expect(event.name).toBe("purchase");
      expect(event.properties?.amount).toBe(100);
      expect(event.properties?.currency).toBe("USD");
      expect(event.timestamp).toBe(1699999999999);
    });
  });

  describe("AnalyticsClient", () => {
    it("should have required track method", () => {
      const client: AnalyticsClient = {
        track: (name) => {
          expect(name).toBe("test");
        },
        identify: () => {},
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

    it.each([
      { hasFlush: true },
      { hasFlush: false },
    ])("should $hasFlush ? 'have' : 'not have' flush method", ({ hasFlush }) => {
      const client: AnalyticsClient = {
        track: () => {},
        identify: () => {},
        ...(hasFlush ? { flush: async () => {} } : {}),
      };
      if (hasFlush) {
        expect(typeof client.flush).toBe("function");
      } else {
        expect(client.flush).toBeUndefined();
      }
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
        track: (event) => {
          events.push(event);
        },
      };
      transport.track({ name: "event1" });
      transport.track({ name: "event2" });
      expect(events).toHaveLength(2);
    });

    it("should allow async track implementation", () => {
      const transport: AnalyticsTransport = {
        track: async (event) => {
          await Promise.resolve();
        },
      };
      expect(transport.track({ name: "test" })).toBeInstanceOf(Promise);
    });
  });

  describe("GrowthBookConfig", () => {
    const REQUIRED_CONFIG = {
      apiHost: "https://cdn.growthbook.io",
      clientKey: "sdk-key",
    };

    it("should require apiHost", () => {
      const config: GrowthBookConfig = { ...REQUIRED_CONFIG };
      expect(config.apiHost).toBe("https://cdn.growthbook.io");
    });

    it("should require clientKey", () => {
      const config: GrowthBookConfig = { ...REQUIRED_CONFIG };
      expect(config.clientKey).toBe("sdk-key");
    });

    it.each([
      { field: "enableDevMode", value: true },
      { field: "attributes", value: { browser: "chrome" } },
    ])("should have optional $field", ({ field, value }) => {
      const config: GrowthBookConfig = {
        ...REQUIRED_CONFIG,
        [field]: value,
      };
      expect((config as any)[field]).toEqual(value);
    });
  });
});
