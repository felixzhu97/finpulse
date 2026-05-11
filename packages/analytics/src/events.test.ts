import { describe, it, expect } from "vitest";
import {
  PAGE_VIEW,
  CTA_CLICK,
  SCREEN_VIEW,
  LOGIN,
  LOGOUT,
  REGISTER,
  PASSWORD_CHANGE,
  SEARCH,
  SIDEBAR_TOGGLE,
  ORDER_CREATE,
  TRADE_EXECUTE,
  WATCHLIST_ADD,
  WATCHLIST_REMOVE,
  WATCHLIST_CREATE,
  PAYMENT_CREATE,
  TRANSFER_SUBMIT,
  REPORT_DOWNLOAD,
} from "./events";

describe("events", () => {
  describe("event constants", () => {
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

  describe("event naming conventions", () => {
    it("should use snake_case for event names", () => {
      const allEvents = [
        PAGE_VIEW,
        CTA_CLICK,
        SCREEN_VIEW,
        LOGIN,
        LOGOUT,
        REGISTER,
        PASSWORD_CHANGE,
        SEARCH,
        SIDEBAR_TOGGLE,
        ORDER_CREATE,
        TRADE_EXECUTE,
        WATCHLIST_ADD,
        WATCHLIST_REMOVE,
        WATCHLIST_CREATE,
        PAYMENT_CREATE,
        TRANSFER_SUBMIT,
        REPORT_DOWNLOAD,
      ];

      allEvents.forEach((event) => {
        expect(event).toMatch(/^[a-z_]+$/);
      });
    });

    it("should have all events as non-empty strings", () => {
      const allEvents = [
        PAGE_VIEW,
        CTA_CLICK,
        SCREEN_VIEW,
        LOGIN,
        LOGOUT,
        REGISTER,
        PASSWORD_CHANGE,
        SEARCH,
        SIDEBAR_TOGGLE,
        ORDER_CREATE,
        TRADE_EXECUTE,
        WATCHLIST_ADD,
        WATCHLIST_REMOVE,
        WATCHLIST_CREATE,
        PAYMENT_CREATE,
        TRANSFER_SUBMIT,
        REPORT_DOWNLOAD,
      ];

      allEvents.forEach((event) => {
        expect(typeof event).toBe("string");
        expect(event.length).toBeGreaterThan(0);
      });
    });
  });
});
