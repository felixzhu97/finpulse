import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createConsoleTransport } from "./console";

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
        transport.track({
          name: "page_view",
          properties: { page: "home" },
        });

        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          "[analytics]",
          "page_view",
          { page: "home" }
        );
      });

      it("should handle event without properties", () => {
        const transport = createConsoleTransport();
        transport.track({ name: "login" });

        expect(consoleInfoSpy).toHaveBeenCalledWith("[analytics]", "login", {});
      });

      it("should handle event with undefined properties", () => {
        const transport = createConsoleTransport();
        transport.track({ name: "test", properties: undefined });

        expect(consoleInfoSpy).toHaveBeenCalledWith("[analytics]", "test", {});
      });

      it("should handle event with timestamp", () => {
        const timestamp = 1699999999999;
        const transport = createConsoleTransport();
        transport.track({
          name: "order_create",
          properties: { orderId: "123" },
          timestamp,
        });

        expect(consoleInfoSpy).toHaveBeenCalledWith("[analytics]", "order_create", {
          orderId: "123",
        });
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
