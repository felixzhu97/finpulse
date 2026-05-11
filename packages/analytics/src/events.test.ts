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

// =============================================================================
// Domain Test Values - Analytics Events
// =============================================================================

const EVENT_DOMAIN = {
  ALL_EVENTS: [
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
  ] as const,

  NAMING: {
    PATTERN: /^[a-z_]+$/,
    MIN_LENGTH: 1,
  },

  CATEGORIES: {
    NAVIGATION: [PAGE_VIEW, SCREEN_VIEW, SIDEBAR_TOGGLE],
    AUTH: [LOGIN, LOGOUT, REGISTER, PASSWORD_CHANGE],
    TRADING: [ORDER_CREATE, TRADE_EXECUTE, WATCHLIST_ADD, WATCHLIST_REMOVE, WATCHLIST_CREATE],
    PAYMENT: [PAYMENT_CREATE, TRANSFER_SUBMIT],
    ENGAGEMENT: [CTA_CLICK, SEARCH, REPORT_DOWNLOAD],
  },
} as const;

// =============================================================================
// Test Suite
// =============================================================================

describe("events", () => {
  describe("event constants", () => {
    it.each([
      { constant: "PAGE_VIEW", value: PAGE_VIEW, expected: "page_view" },
      { constant: "CTA_CLICK", value: CTA_CLICK, expected: "cta_click" },
      { constant: "SCREEN_VIEW", value: SCREEN_VIEW, expected: "screen_view" },
      { constant: "LOGIN", value: LOGIN, expected: "login" },
      { constant: "LOGOUT", value: LOGOUT, expected: "logout" },
      { constant: "REGISTER", value: REGISTER, expected: "register" },
      { constant: "PASSWORD_CHANGE", value: PASSWORD_CHANGE, expected: "password_change" },
      { constant: "SEARCH", value: SEARCH, expected: "search" },
      { constant: "SIDEBAR_TOGGLE", value: SIDEBAR_TOGGLE, expected: "sidebar_toggle" },
      { constant: "ORDER_CREATE", value: ORDER_CREATE, expected: "order_create" },
      { constant: "TRADE_EXECUTE", value: TRADE_EXECUTE, expected: "trade_execute" },
      { constant: "WATCHLIST_ADD", value: WATCHLIST_ADD, expected: "watchlist_add" },
      { constant: "WATCHLIST_REMOVE", value: WATCHLIST_REMOVE, expected: "watchlist_remove" },
      { constant: "WATCHLIST_CREATE", value: WATCHLIST_CREATE, expected: "watchlist_create" },
      { constant: "PAYMENT_CREATE", value: PAYMENT_CREATE, expected: "payment_create" },
      { constant: "TRANSFER_SUBMIT", value: TRANSFER_SUBMIT, expected: "transfer_submit" },
      { constant: "REPORT_DOWNLOAD", value: REPORT_DOWNLOAD, expected: "report_download" },
    ])("should export $constant with correct value", ({ value, expected }) => {
      expect(value).toBe(expected);
    });
  });

  describe("event naming conventions", () => {
    it("should use snake_case for all event names", () => {
      EVENT_DOMAIN.ALL_EVENTS.forEach((event) => {
        expect(event).toMatch(EVENT_DOMAIN.NAMING.PATTERN);
      });
    });

    it("should have all events as non-empty strings", () => {
      EVENT_DOMAIN.ALL_EVENTS.forEach((event) => {
        expect(typeof event).toBe("string");
        expect(event.length).toBeGreaterThanOrEqual(EVENT_DOMAIN.NAMING.MIN_LENGTH);
      });
    });
  });

  describe("event categories", () => {
    it.each([
      { category: "NAVIGATION", events: EVENT_DOMAIN.CATEGORIES.NAVIGATION },
      { category: "AUTH", events: EVENT_DOMAIN.CATEGORIES.AUTH },
      { category: "TRADING", events: EVENT_DOMAIN.CATEGORIES.TRADING },
      { category: "PAYMENT", events: EVENT_DOMAIN.CATEGORIES.PAYMENT },
      { category: "ENGAGEMENT", events: EVENT_DOMAIN.CATEGORIES.ENGAGEMENT },
    ])("should have valid $category events", ({ events }) => {
      events.forEach((event) => {
        expect(event).toBeDefined();
        expect(typeof event).toBe("string");
        expect(event.length).toBeGreaterThan(0);
      });
    });
  });
});
