import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHttpTransport } from "./http";

// =============================================================================
// Domain Test Values - HTTP Transport
// =============================================================================

const HTTP_DOMAIN = {
  BASE_URL: {
    VALID: "https://api.example.com",
    WITH_TRAILING_SLASH: "https://api.example.com/",
    NORMALIZED: "https://api.example.com",
  },

  ENDPOINT: "/analytics/events",

  SOURCE: {
    WEB: "web-app",
    MOBILE: "mobile",
    NONE: null,
  },

  HEADERS: {
    CONTENT_TYPE: "application/json",
  },

  EVENTS: {
    BASIC: { name: "page_view" },
    WITH_PROPERTIES: { name: "page_view", properties: { page: "home" } },
    WITH_TIMESTAMP: { name: "test_event", properties: {}, timestamp: 1699999999999 },
    EMPTY_PROPS: { name: "login" },
    WITH_SOURCE: {
      name: "trade",
      properties: { symbol: "AAPL", quantity: 100 },
    },
  },

  ERROR_MESSAGES: {
    NETWORK: "Network error",
  },
} as const;

// =============================================================================
// Test Suite
// =============================================================================

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
      const transport = createHttpTransport(HTTP_DOMAIN.BASE_URL.VALID);
      expect(transport).toBeDefined();
      expect(typeof transport.track).toBe("function");
    });

    describe("track", () => {
      it("should call fetch with correct URL and method", () => {
        const transport = createHttpTransport(HTTP_DOMAIN.BASE_URL.VALID);
        transport.track(HTTP_DOMAIN.EVENTS.BASIC);

        expect(fetchSpy).toHaveBeenCalledWith(
          `${HTTP_DOMAIN.BASE_URL.VALID}${HTTP_DOMAIN.ENDPOINT}`,
          expect.objectContaining({ method: "POST" })
        );
      });

      it.each([
        {
          event: HTTP_DOMAIN.EVENTS.WITH_PROPERTIES,
          expectedPayload: { name: "page_view", properties: { page: "home" } },
        },
        {
          event: HTTP_DOMAIN.EVENTS.EMPTY_PROPS,
          expectedPayload: { name: "login", properties: {} },
        },
      ])(
        "should send correct payload for event $event.name",
        async ({ event, expectedPayload }) => {
          const transport = createHttpTransport(HTTP_DOMAIN.BASE_URL.VALID);
          transport.track(event);

          await vi.waitFor(() => {
            const [, options] = fetchSpy.mock.calls[0];
            const body = JSON.parse(options.body as string);
            expect(body).toMatchObject(expectedPayload);
          });
        }
      );

      it.each([
        { timestamp: HTTP_DOMAIN.EVENTS.WITH_TIMESTAMP.timestamp },
        { timestamp: Date.now() },
      ])("should include timestamp in payload", async ({ timestamp }) => {
        const transport = createHttpTransport(HTTP_DOMAIN.BASE_URL.VALID);
        transport.track({ name: "test", properties: {}, timestamp });

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.timestamp).toBeDefined();
        });
      });

      it("should set correct Content-Type header", async () => {
        const transport = createHttpTransport(HTTP_DOMAIN.BASE_URL.VALID);
        transport.track(HTTP_DOMAIN.EVENTS.BASIC);

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          expect(options.headers).toEqual({
            "Content-Type": HTTP_DOMAIN.HEADERS.CONTENT_TYPE,
          });
        });
      });

      it("should add source to properties when provided", async () => {
        const transport = createHttpTransport(
          HTTP_DOMAIN.BASE_URL.VALID,
          HTTP_DOMAIN.SOURCE.WEB
        );
        transport.track(HTTP_DOMAIN.EVENTS.WITH_PROPERTIES);

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.properties).toEqual({
            page: "home",
            source: HTTP_DOMAIN.SOURCE.WEB,
          });
        });
      });

      it("should not add source property when not provided", async () => {
        const transport = createHttpTransport(HTTP_DOMAIN.BASE_URL.VALID);
        transport.track(HTTP_DOMAIN.EVENTS.WITH_PROPERTIES);

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.properties).not.toHaveProperty("source");
        });
      });

      it.each([
        { url: HTTP_DOMAIN.BASE_URL.WITH_TRAILING_SLASH, expected: `${HTTP_DOMAIN.BASE_URL.NORMALIZED}${HTTP_DOMAIN.ENDPOINT}` },
      ])(
        "should normalize baseUrl by removing trailing slash",
        ({ url, expected }) => {
          const transport = createHttpTransport(url);
          transport.track(HTTP_DOMAIN.EVENTS.BASIC);

          expect(fetchSpy).toHaveBeenCalledWith(
            expected,
            expect.any(Object)
          );
        }
      );

      it("should not fail when fetch throws an error", () => {
        fetchSpy.mockRejectedValueOnce(new Error(HTTP_DOMAIN.ERROR_MESSAGES.NETWORK));
        const transport = createHttpTransport(HTTP_DOMAIN.BASE_URL.VALID);

        expect(() => transport.track(HTTP_DOMAIN.EVENTS.BASIC)).not.toThrow();
      });

      it("should merge source with existing properties", async () => {
        const transport = createHttpTransport(
          HTTP_DOMAIN.BASE_URL.VALID,
          HTTP_DOMAIN.SOURCE.MOBILE
        );
        transport.track(HTTP_DOMAIN.EVENTS.WITH_SOURCE);

        await vi.waitFor(() => {
          const [, options] = fetchSpy.mock.calls[0];
          const body = JSON.parse(options.body as string);
          expect(body.properties).toEqual({
            symbol: "AAPL",
            quantity: 100,
            source: HTTP_DOMAIN.SOURCE.MOBILE,
          });
        });
      });
    });
  });
});
