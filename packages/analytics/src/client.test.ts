import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createAnalyticsClient, createNoopClient } from "./client";
import type { AnalyticsEvent, AnalyticsTransport } from "./types";

// =============================================================================
// Domain Test Values - Analytics Context
// =============================================================================

const ANALYTICS_DOMAIN = {
  EVENTS: {
    PAGE_VIEW: "page_view",
    LOGIN: "login",
    LOGOUT: "logout",
    PURCHASE: "purchase",
    SEARCH: "search",
    CTA_CLICK: "cta_click",
    ORDER_CREATE: "order_create",
    TRADE_EXECUTE: "trade_execute",
  } as const,

  PROPERTIES: {
    VALID: {
      page: "home",
      userId: "user-123",
      email: "test@example.com",
      plan: "pro",
      tier: "premium",
      amount: 100,
      currency: "USD",
      symbol: "AAPL",
      quantity: 50,
    },
    EMPTY: {},
  },

  TIMESTAMPS: {
    NOW: Date.now(),
    PAST: new Date("2024-01-01").getTime(),
    FUTURE: new Date("2030-12-31").getTime(),
    EDGE: 1699999999999,
  },
} as const;

// =============================================================================
// Test Factories
// =============================================================================

const createMockTransport = (): AnalyticsTransport => ({
  track: vi.fn(),
});

const createTrackSpy = (transport: AnalyticsTransport) =>
  transport.track as Mock<(event: AnalyticsEvent) => void | Promise<void>>;

// =============================================================================
// Test Suite
// =============================================================================

describe("client", () => {
  describe("createAnalyticsClient", () => {
    let mockTransport: AnalyticsTransport;
    let mockTrack: Mock<(event: AnalyticsEvent) => void | Promise<void>>;

    beforeEach(() => {
      mockTransport = createMockTransport();
      mockTrack = createTrackSpy(mockTransport);
    });

    describe("track", () => {
      it("should create a client with track and identify methods", () => {
        const client = createAnalyticsClient(mockTransport);
        expect(client).toBeDefined();
        expect(typeof client.track).toBe("function");
        expect(typeof client.identify).toBe("function");
      });

      it("should call transport.track with correct event structure", () => {
        const client = createAnalyticsClient(mockTransport);
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW, {
          page: ANALYTICS_DOMAIN.PROPERTIES.VALID.page,
        });

        expect(mockTrack).toHaveBeenCalledTimes(1);
        const event = mockTrack.mock.calls[0][0];
        expect(event.name).toBe(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW);
        expect(event.properties).toEqual({
          page: ANALYTICS_DOMAIN.PROPERTIES.VALID.page,
        });
        expect(typeof event.timestamp).toBe("number");
      });

      it("should merge userId from identify into event properties", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId, {
          email: ANALYTICS_DOMAIN.PROPERTIES.VALID.email,
        });
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW, {
          page: ANALYTICS_DOMAIN.PROPERTIES.VALID.page,
        });

        const event = mockTrack.mock.calls[0][0];
        expect(event.properties?.userId).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId);
        expect(event.properties?.email).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.email);
        expect(event.properties?.page).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.page);
      });

      it("should only include traits without userId when not identified", () => {
        const client = createAnalyticsClient(mockTransport);
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW, {
          page: ANALYTICS_DOMAIN.PROPERTIES.VALID.page,
        });

        const event = mockTrack.mock.calls[0][0];
        expect(event.properties?.userId).toBeUndefined();
        expect(event.properties?.page).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.page);
      });

      it("should merge multiple identify calls", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId, {
          plan: ANALYTICS_DOMAIN.PROPERTIES.VALID.plan,
        });
        client.identify(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId, {
          tier: ANALYTICS_DOMAIN.PROPERTIES.VALID.tier,
        });
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW);

        const event = mockTrack.mock.calls[0][0];
        expect(event.properties?.userId).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId);
        expect(event.properties?.plan).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.plan);
        expect(event.properties?.tier).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.tier);
      });

      it.each([
        { name: ANALYTICS_DOMAIN.EVENTS.LOGIN },
        { name: ANALYTICS_DOMAIN.EVENTS.LOGOUT },
        { name: ANALYTICS_DOMAIN.EVENTS.SEARCH },
      ])("should allow track without properties for event: $name", ({ name }) => {
        const client = createAnalyticsClient(mockTransport);
        client.track(name);

        const event = mockTrack.mock.calls[0][0];
        expect(event.name).toBe(name);
        expect(event.properties).toEqual(ANALYTICS_DOMAIN.PROPERTIES.EMPTY);
      });

      it("should use Date.now() for timestamp within expected range", () => {
        const before = Date.now();
        const client = createAnalyticsClient(mockTransport);
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW);
        const after = Date.now();

        const event = mockTrack.mock.calls[0][0];
        expect(event.timestamp).toBeGreaterThanOrEqual(before);
        expect(event.timestamp).toBeLessThanOrEqual(after);
      });
    });

    describe("identify", () => {
      it("should set userId without traits", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId);
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW);

        const event = mockTrack.mock.calls[0][0];
        expect(event.properties?.userId).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId);
      });

      it("should set both userId and traits", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId, {
          name: "John",
        });

        expect(mockTrack).not.toHaveBeenCalled();
      });

      it("should override previous userId", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-1");
        client.identify("user-2");
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW);

        const event = mockTrack.mock.calls[0][0];
        expect(event.properties?.userId).toBe("user-2");
      });

      it("should merge new traits with existing traits", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-1", { name: "John" });
        client.identify("user-1", { plan: ANALYTICS_DOMAIN.PROPERTIES.VALID.plan });
        client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW);

        const event = mockTrack.mock.calls[0][0];
        expect(event.properties?.name).toBe("John");
        expect(event.properties?.plan).toBe(ANALYTICS_DOMAIN.PROPERTIES.VALID.plan);
      });
    });
  });

  describe("createNoopClient", () => {
    it("should create a noop client with track and identify methods", () => {
      const client = createNoopClient();
      expect(client).toBeDefined();
      expect(typeof client.track).toBe("function");
      expect(typeof client.identify).toBe("function");
    });

    it.each([
      { method: "track", args: [ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW] },
      { method: "identify", args: [ANALYTICS_DOMAIN.PROPERTIES.VALID.userId] },
    ])("should not throw when calling $method", ({ method, args }) => {
      const client = createNoopClient();
      expect(() => (client as any)[method](...args)).not.toThrow();
    });

    it("should not call any transport", () => {
      const client = createNoopClient();
      client.track(ANALYTICS_DOMAIN.EVENTS.PAGE_VIEW, {
        page: ANALYTICS_DOMAIN.PROPERTIES.VALID.page,
      });
      client.identify(ANALYTICS_DOMAIN.PROPERTIES.VALID.userId, {
        name: "Test",
      });
      // No assertions needed - just ensure no errors
    });
  });
});
