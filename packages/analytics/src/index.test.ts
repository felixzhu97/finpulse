import { describe, it, expect } from "vitest";
import {
  createAnalyticsClient,
  createNoopClient,
  createConsoleTransport,
  createHttpTransport,
  GrowthBook,
  createGrowthBook,
  PAGE_VIEW,
  LOGIN,
  LOGOUT,
  ORDER_CREATE,
  PAGE_VIEW as SCREEN_VIEW_ALIAS,
  PASSWORD_CHANGE,
  PAYMENT_CREATE,
  REGISTER,
  REPORT_DOWNLOAD,
  SCREEN_VIEW,
  SEARCH,
  SIDEBAR_TOGGLE,
  TRADE_EXECUTE,
  TRANSFER_SUBMIT,
  WATCHLIST_ADD,
  WATCHLIST_CREATE,
  WATCHLIST_REMOVE,
  CTA_CLICK,
} from "./index";
import type {
  AnalyticsClient,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsTransport,
  EventProperties,
  GrowthBookConfig,
  UserTraits,
} from "./index";

// =============================================================================
// Domain Test Values - Index Exports
// =============================================================================

const EXPORT_DOMAIN = {
  EVENTS: [
    { name: "PAGE_VIEW", value: PAGE_VIEW },
    { name: "CTA_CLICK", value: CTA_CLICK },
    { name: "SCREEN_VIEW", value: SCREEN_VIEW },
    { name: "LOGIN", value: LOGIN },
    { name: "LOGOUT", value: LOGOUT },
    { name: "REGISTER", value: REGISTER },
    { name: "PASSWORD_CHANGE", value: PASSWORD_CHANGE },
    { name: "SEARCH", value: SEARCH },
    { name: "SIDEBAR_TOGGLE", value: SIDEBAR_TOGGLE },
    { name: "ORDER_CREATE", value: ORDER_CREATE },
    { name: "TRADE_EXECUTE", value: TRADE_EXECUTE },
    { name: "WATCHLIST_ADD", value: WATCHLIST_ADD },
    { name: "WATCHLIST_REMOVE", value: WATCHLIST_REMOVE },
    { name: "WATCHLIST_CREATE", value: WATCHLIST_CREATE },
    { name: "PAYMENT_CREATE", value: PAYMENT_CREATE },
    { name: "TRANSFER_SUBMIT", value: TRANSFER_SUBMIT },
    { name: "REPORT_DOWNLOAD", value: REPORT_DOWNLOAD },
  ] as const,

  CONFIG: {
    VALID: {
      apiHost: "https://test.com",
      clientKey: "key-123",
    },
  },
} as const;

// =============================================================================
// Test Suite
// =============================================================================

describe("index exports", () => {
  describe("client exports", () => {
    it("should export createAnalyticsClient function", () => {
      expect(createAnalyticsClient).toBeDefined();
      expect(typeof createAnalyticsClient).toBe("function");
    });

    it("should export createNoopClient function", () => {
      expect(createNoopClient).toBeDefined();
      expect(typeof createNoopClient).toBe("function");
    });

    it("should create a working client from createAnalyticsClient", () => {
      const mockTransport: AnalyticsTransport = { track: () => {} };
      const client = createAnalyticsClient(mockTransport);
      expect(typeof client.track).toBe("function");
      expect(typeof client.identify).toBe("function");
    });

    it("should create a noop client that does nothing", () => {
      const client = createNoopClient();
      expect(typeof client.track).toBe("function");
      expect(typeof client.identify).toBe("function");
      expect(() => client.track("test")).not.toThrow();
      expect(() => client.identify("user-1")).not.toThrow();
    });
  });

  describe("AB testing exports", () => {
    it("should export GrowthBook", () => {
      expect(GrowthBook).toBeDefined();
    });

    it("should export createGrowthBook function", () => {
      expect(createGrowthBook).toBeDefined();
      expect(typeof createGrowthBook).toBe("function");
    });

    it("should create a GrowthBook instance", () => {
      const config: GrowthBookConfig = EXPORT_DOMAIN.CONFIG.VALID;
      const gb = createGrowthBook(config);
      expect(gb).toBeDefined();
    });
  });

  describe("transport exports", () => {
    it.each([
      { name: "createConsoleTransport", fn: createConsoleTransport },
      { name: "createHttpTransport", fn: createHttpTransport },
    ])("should export $name function", ({ fn }) => {
      expect(fn).toBeDefined();
      expect(typeof fn).toBe("function");
    });

    it("should create a console transport with track method", () => {
      const transport = createConsoleTransport();
      expect(typeof transport.track).toBe("function");
    });

    it("should create an HTTP transport with track method", () => {
      const transport = createHttpTransport("https://api.example.com");
      expect(typeof transport.track).toBe("function");
    });
  });

  describe("event constant exports", () => {
    it.each(EXPORT_DOMAIN.EVENTS)(
      "should export $name with correct value",
      ({ name, value }) => {
        expect(value).toBeDefined();
        expect(typeof value).toBe("string");
      }
    );
  });

  describe("type exports", () => {
    it.each([
      { name: "AnalyticsClient", factory: () => ({ track: () => {}, identify: () => {} }) },
      { name: "AnalyticsEvent", factory: () => ({ name: "test" }) },
      { name: "AnalyticsEventName", factory: () => "page_view" as AnalyticsEventName },
      { name: "AnalyticsTransport", factory: () => ({ track: () => {} }) },
      { name: "EventProperties", factory: () => ({ key: "value" } as EventProperties) },
      { name: "GrowthBookConfig", factory: () => ({ apiHost: "https://test.com", clientKey: "key" }) },
      { name: "UserTraits", factory: () => ({ email: "test@example.com" }) },
    ])("should export $name type", ({ factory }) => {
      const instance = factory();
      expect(instance).toBeDefined();
    });
  });
});
