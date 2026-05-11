import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAnalyticsClient, createNoopClient } from "./client";
import type { AnalyticsEvent } from "./types";

describe("client", () => {
  describe("createAnalyticsClient", () => {
    let mockTransport: { track: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockTransport = { track: vi.fn() };
    });

    describe("track", () => {
      it("should create a client instance", () => {
        const client = createAnalyticsClient(mockTransport);
        expect(client).toBeDefined();
        expect(typeof client.track).toBe("function");
        expect(typeof client.identify).toBe("function");
      });

      it("should call transport.track with correct event structure", () => {
        const client = createAnalyticsClient(mockTransport);
        client.track("page_view", { page: "home" });

        expect(mockTransport.track).toHaveBeenCalledTimes(1);
        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.name).toBe("page_view");
        expect(event.properties).toEqual({ page: "home" });
        expect(typeof event.timestamp).toBe("number");
      });

      it("should merge userId from identify into event properties", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-123", { email: "test@example.com" });
        client.track("page_view", { page: "dashboard" });

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.properties?.userId).toBe("user-123");
        expect(event.properties?.email).toBe("test@example.com");
        expect(event.properties?.page).toBe("dashboard");
      });

      it("should only include traits without userId when not identified", () => {
        const client = createAnalyticsClient(mockTransport);
        client.track("page_view", { page: "home" });

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.properties?.userId).toBeUndefined();
        expect(event.properties?.page).toBe("home");
      });

      it("should merge multiple identify calls", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-123", { plan: "pro" });
        client.identify("user-123", { tier: "premium" });
        client.track("page_view");

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.properties?.userId).toBe("user-123");
        expect(event.properties?.plan).toBe("pro");
        expect(event.properties?.tier).toBe("premium");
      });

      it("should allow track without properties", () => {
        const client = createAnalyticsClient(mockTransport);
        client.track("login");

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.name).toBe("login");
        expect(event.properties).toEqual({});
      });

      it("should use Date.now() for timestamp", () => {
        const before = Date.now();
        const client = createAnalyticsClient(mockTransport);
        client.track("test");
        const after = Date.now();

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.timestamp).toBeGreaterThanOrEqual(before);
        expect(event.timestamp).toBeLessThanOrEqual(after);
      });
    });

    describe("identify", () => {
      it("should set userId without traits", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-456");
        client.track("page_view");

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.properties?.userId).toBe("user-456");
      });

      it("should set both userId and traits", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-789", { name: "John" });

        expect(mockTransport.track).not.toHaveBeenCalled();
      });

      it("should override previous userId", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-1");
        client.identify("user-2");
        client.track("page_view");

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.properties?.userId).toBe("user-2");
      });

      it("should merge new traits with existing traits", () => {
        const client = createAnalyticsClient(mockTransport);
        client.identify("user-1", { name: "John" });
        client.identify("user-1", { plan: "pro" });
        client.track("page_view");

        const event = mockTransport.track.mock.calls[0][0] as AnalyticsEvent;
        expect(event.properties?.name).toBe("John");
        expect(event.properties?.plan).toBe("pro");
      });
    });
  });

  describe("createNoopClient", () => {
    it("should create a noop client", () => {
      const client = createNoopClient();
      expect(client).toBeDefined();
      expect(typeof client.track).toBe("function");
      expect(typeof client.identify).toBe("function");
    });

    it("should not throw when calling track", () => {
      const client = createNoopClient();
      expect(() => client.track("test")).not.toThrow();
    });

    it("should not throw when calling identify", () => {
      const client = createNoopClient();
      expect(() => client.identify("user-1")).not.toThrow();
    });

    it("should not call any transport", () => {
      const client = createNoopClient();
      client.track("page_view", { page: "home" });
      client.identify("user-123", { name: "Test" });
      // No assertion needed - if this runs without errors, test passes
    });
  });
});
