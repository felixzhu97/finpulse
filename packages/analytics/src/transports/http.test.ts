import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHttpTransport } from "./http";

describe("transports/http", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(new Response() as any);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe("createHttpTransport", () => {
    it("should create a transport with a track method", () => {
      const transport = createHttpTransport("https://api.example.com");
      expect(transport).toBeDefined();
      expect(typeof transport.track).toBe("function");
    });

    describe("track", () => {
      it("should call fetch with correct URL", () => {
        const transport = createHttpTransport("https://api.example.com");
        transport.track({ name: "page_view" });

        expect(fetchSpy).toHaveBeenCalledWith(
          "https://api.example.com/analytics/events",
          expect.objectContaining({ method: "POST" })
        );
      });

      it("should send correct payload with event name and properties", async () => {
        const transport = createHttpTransport("https://api.example.com");
        transport.track({
          name: "page_view",
          properties: { page: "home" },
        });

        await vi.waitFor(() => {
          const [url, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.name).toBe("page_view");
          expect(body.properties).toEqual({ page: "home" });
        });
      });

      it("should include timestamp in payload", async () => {
        const timestamp = 1699999999999;
        const transport = createHttpTransport("https://api.example.com");
        transport.track({
          name: "test_event",
          properties: {},
          timestamp,
        });

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.timestamp).toBe(timestamp);
        });
      });

      it("should use Date.now() when timestamp is not provided", async () => {
        const before = Date.now();
        const transport = createHttpTransport("https://api.example.com");
        transport.track({ name: "test" });
        const after = Date.now();

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.timestamp).toBeGreaterThanOrEqual(before);
          expect(body.timestamp).toBeLessThanOrEqual(after);
        });
      });

      it("should set correct Content-Type header", async () => {
        const transport = createHttpTransport("https://api.example.com");
        transport.track({ name: "test" });

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          expect(options.headers).toEqual({ "Content-Type": "application/json" });
        });
      });

      it("should add source to properties when provided", async () => {
        const transport = createHttpTransport(
          "https://api.example.com",
          "web-app"
        );
        transport.track({
          name: "page_view",
          properties: { page: "home" },
        });

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.properties).toEqual({ page: "home", source: "web-app" });
        });
      });

      it("should not add source property when not provided", async () => {
        const transport = createHttpTransport("https://api.example.com");
        transport.track({
          name: "page_view",
          properties: { page: "home" },
        });

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.properties).not.toHaveProperty("source");
        });
      });

      it("should normalize baseUrl by removing trailing slash", async () => {
        const transport = createHttpTransport("https://api.example.com/");
        transport.track({ name: "test" });

        expect(fetchSpy).toHaveBeenCalledWith(
          "https://api.example.com/analytics/events",
          expect.any(Object)
        );
      });

      it("should not fail when fetch throws an error", async () => {
        fetchSpy.mockRejectedValueOnce(new Error("Network error"));
        const transport = createHttpTransport("https://api.example.com");

        expect(() => transport.track({ name: "test" })).not.toThrow();
      });

      it("should handle empty properties", async () => {
        const transport = createHttpTransport("https://api.example.com");
        transport.track({ name: "login" });

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.properties).toEqual({});
        });
      });

      it("should merge source with existing properties", async () => {
        const transport = createHttpTransport(
          "https://api.example.com",
          "mobile"
        );
        transport.track({
          name: "trade",
          properties: { symbol: "AAPL", quantity: 100 },
        });

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.properties).toEqual({
            symbol: "AAPL",
            quantity: 100,
            source: "mobile",
          });
        });
      });
    });
  });
});
