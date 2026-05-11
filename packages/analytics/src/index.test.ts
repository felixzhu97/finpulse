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

describe("index exports", () => {
  describe("client exports", () => {
    it("should export createAnalyticsClient", () => {
      expect(createAnalyticsClient).toBeDefined();
      expect(typeof createAnalyticsClient).toBe("function");
    });

    it("should export createNoopClient", () => {
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

    it("should export createGrowthBook", () => {
      expect(createGrowthBook).toBeDefined();
      expect(typeof createGrowthBook).toBe("function");
    });

    it("should create a GrowthBook instance", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://test.com",
        clientKey: "key-123",
      };
      const gb = createGrowthBook(config);
      expect(gb).toBeDefined();
    });
  });

  describe("transport exports", () => {
    it("should export createConsoleTransport", () => {
      expect(createConsoleTransport).toBeDefined();
      expect(typeof createConsoleTransport).toBe("function");
    });

    it("should export createHttpTransport", () => {
      expect(createHttpTransport).toBeDefined();
      expect(typeof createHttpTransport).toBe("function");
    });

    it("should create a console transport", () => {
      const transport = createConsoleTransport();
      expect(typeof transport.track).toBe("function");
    });

    it("should create an HTTP transport", () => {
      const transport = createHttpTransport("https://api.example.com");
      expect(typeof transport.track).toBe("function");
    });
  });

  describe("event constant exports", () => {
    it("should export PAGE_VIEW", () => {
      expect(PAGE_VIEW).toBe("page_view");
    });

    it("should export CTA_CLICK", () => {
      expect(CTA_CLICK).toBe("cta_click");
    });

    it("should export SCREEN_VIEW", () => {
      expect(SCREEN_VIEW).toBe("screen_view");
    });

    it("should export LOGIN", () => {
      expect(LOGIN).toBe("login");
    });

    it("should export LOGOUT", () => {
      expect(LOGOUT).toBe("logout");
    });

    it("should export REGISTER", () => {
      expect(REGISTER).toBe("register");
    });

    it("should export PASSWORD_CHANGE", () => {
      expect(PASSWORD_CHANGE).toBe("password_change");
    });

    it("should export SEARCH", () => {
      expect(SEARCH).toBe("search");
    });

    it("should export SIDEBAR_TOGGLE", () => {
      expect(SIDEBAR_TOGGLE).toBe("sidebar_toggle");
    });

    it("should export ORDER_CREATE", () => {
      expect(ORDER_CREATE).toBe("order_create");
    });

    it("should export TRADE_EXECUTE", () => {
      expect(TRADE_EXECUTE).toBe("trade_execute");
    });

    it("should export WATCHLIST_ADD", () => {
      expect(WATCHLIST_ADD).toBe("watchlist_add");
    });

    it("should export WATCHLIST_REMOVE", () => {
      expect(WATCHLIST_REMOVE).toBe("watchlist_remove");
    });

    it("should export WATCHLIST_CREATE", () => {
      expect(WATCHLIST_CREATE).toBe("watchlist_create");
    });

    it("should export PAYMENT_CREATE", () => {
      expect(PAYMENT_CREATE).toBe("payment_create");
    });

    it("should export TRANSFER_SUBMIT", () => {
      expect(TRANSFER_SUBMIT).toBe("transfer_submit");
    });

    it("should export REPORT_DOWNLOAD", () => {
      expect(REPORT_DOWNLOAD).toBe("report_download");
    });
  });

  describe("type exports", () => {
    it("should export AnalyticsClient type", () => {
      const client: AnalyticsClient = {
        track: () => {},
        identify: () => {},
      };
      expect(client).toBeDefined();
    });

    it("should export AnalyticsEvent type", () => {
      const event: AnalyticsEvent = { name: "test" };
      expect(event).toBeDefined();
    });

    it("should export AnalyticsEventName type", () => {
      const name: AnalyticsEventName = "page_view";
      expect(name).toBe("page_view");
    });

    it("should export AnalyticsTransport type", () => {
      const transport: AnalyticsTransport = {
        track: () => {},
      };
      expect(transport).toBeDefined();
    });

    it("should export EventProperties type", () => {
      const props: EventProperties = { key: "value" };
      expect(props).toBeDefined();
    });

    it("should export GrowthBookConfig type", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://test.com",
        clientKey: "key",
      };
      expect(config).toBeDefined();
    });

    it("should export UserTraits type", () => {
      const traits: UserTraits = { email: "test@example.com" };
      expect(traits).toBeDefined();
    });
  });
});
