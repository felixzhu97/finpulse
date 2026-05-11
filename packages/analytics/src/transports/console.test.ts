import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createConsoleTransport } from "./console";

// =============================================================================
// Domain Test Values - Console Transport
// =============================================================================

const CONSOLE_DOMAIN = {
  EVENTS: {
    WITH_PROPS: { name: "page_view", properties: { page: "home" } },
    WITHOUT_PROPS: { name: "login" },
    WITH_UNDEFINED_PROPS: { name: "test", properties: undefined },
    WITH_TIMESTAMP: {
      name: "order_create",
      properties: { orderId: "123" },
      timestamp: 1699999999999,
    },
  },

  LOG_PREFIX: "[analytics]",

  ERROR_CASES: {
    CONSOLE_UNDEFINED: "console is undefined",
    INFO_UNDEFINED: "console.info is undefined",
  },
} as const;

// =============================================================================
// Test Suite
// =============================================================================

describe("transports/console", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
  });

  describe("createConsoleTransport", () => {
    it("should create a transport with a track method", () => {
      const transport = createConsoleTransport();
      expect(transport).toBeDefined();
      expect(typeof transport.track).toBe("function");
    });

    describe("track", () => {
      it("should log event to console.info with event name and properties", () => {
        const transport = createConsoleTransport();
        transport.track(CONSOLE_DOMAIN.EVENTS.WITH_PROPS);

        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          CONSOLE_DOMAIN.LOG_PREFIX,
          CONSOLE_DOMAIN.EVENTS.WITH_PROPS.name,
          CONSOLE_DOMAIN.EVENTS.WITH_PROPS.properties
        );
      });

      it.each([
        { event: CONSOLE_DOMAIN.EVENTS.WITHOUT_PROPS, expectedProps: {} },
        { event: CONSOLE_DOMAIN.EVENTS.WITH_UNDEFINED_PROPS, expectedProps: {} },
      ])(
        "should handle event $event.name and log $expectedProps",
        ({ event, expectedProps }) => {
          const transport = createConsoleTransport();
          transport.track(event);

          expect(consoleInfoSpy).toHaveBeenCalledWith(
            CONSOLE_DOMAIN.LOG_PREFIX,
            event.name,
            expectedProps
          );
        }
      );

      it("should handle event with timestamp", () => {
        const transport = createConsoleTransport();
        transport.track(CONSOLE_DOMAIN.EVENTS.WITH_TIMESTAMP);

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          CONSOLE_DOMAIN.LOG_PREFIX,
          CONSOLE_DOMAIN.EVENTS.WITH_TIMESTAMP.name,
          CONSOLE_DOMAIN.EVENTS.WITH_TIMESTAMP.properties
        );
      });

      it("should not throw when console.info is undefined", () => {
        const originalConsole = global.console;
        Object.defineProperty(global, "console", {
          value: { ...originalConsole, info: undefined as any },
          configurable: true,
        });

        const transport = createConsoleTransport();
        expect(() => transport.track({ name: "test", properties: {} })).not.toThrow();

        Object.defineProperty(global, "console", {
          value: originalConsole,
          configurable: true,
        });
      });

      it("should not throw when console is undefined", () => {
        const originalConsole = global.console;
        Object.defineProperty(global, "console", {
          value: undefined,
          configurable: true,
        });

        const transport = createConsoleTransport();
        expect(() =>
          transport.track({ name: "test", properties: {} })
        ).not.toThrow();

        Object.defineProperty(global, "console", {
          value: originalConsole,
          configurable: true,
        });
      });
    });
  });
});
