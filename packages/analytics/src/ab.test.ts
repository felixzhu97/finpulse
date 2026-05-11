import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createGrowthBook, GrowthBook } from "./ab";
import type { GrowthBookConfig } from "./types";

vi.mock("@growthbook/growthbook", () => {
  const mockFn = vi.fn().mockImplementation(function (this: any, config: any) {
    this.apiHost = config.apiHost;
    this.clientKey = config.clientKey;
    this.enableDevMode = config.enableDevMode;
    this.attributes = config.attributes;
    this.setFeatures = vi.fn().mockReturnThis();
    this.setAttributes = vi.fn().mockReturnThis();
    this.setTrackingCallback = vi.fn().mockReturnThis();
    this.init = vi.fn();
    this.destroy = vi.fn();
  });
  return { GrowthBook: mockFn };
});

describe("ab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createGrowthBook", () => {
    it("should create a GrowthBook instance", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
      };

      const gb = createGrowthBook(config);
      expect(gb).toBeDefined();
    });

    it("should pass apiHost to GrowthBook constructor", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
      };

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          apiHost: "https://cdn.growthbook.io",
        })
      );
    });

    it("should pass clientKey to GrowthBook constructor", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
      };

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          clientKey: "sdk-abc123",
        })
      );
    });

    it("should set enableDevMode to false by default", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
      };

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          enableDevMode: false,
        })
      );
    });

    it("should pass enableDevMode when provided", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
        enableDevMode: true,
      };

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          enableDevMode: true,
        })
      );
    });

    it("should pass attributes when provided", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
        attributes: {
          id: "user-123",
          browser: "chrome",
        },
      };

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: {
            id: "user-123",
            browser: "chrome",
          },
        })
      );
    });

    it("should not pass attributes when not provided", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
      };

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.not.objectContaining({
          attributes: expect.anything(),
        })
      );
    });

    it("should return a GrowthBook instance with expected methods", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-abc123",
      };

      const gb = createGrowthBook(config);

      expect(gb).toHaveProperty("init");
      expect(gb).toHaveProperty("destroy");
    });
  });

  describe("GrowthBook", () => {
    it("should be exported from the module", () => {
      expect(GrowthBook).toBeDefined();
    });

    it("should be a constructor function", () => {
      expect(typeof GrowthBook).toBe("function");
    });
  });

  describe("GrowthBookConfig type export", () => {
    it("should allow creating config with required fields", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-key",
      };

      expect(config.apiHost).toBe("https://cdn.growthbook.io");
      expect(config.clientKey).toBe("sdk-key");
    });

    it("should allow creating config with optional fields", () => {
      const config: GrowthBookConfig = {
        apiHost: "https://cdn.growthbook.io",
        clientKey: "sdk-key",
        enableDevMode: true,
        attributes: { userId: "123" },
      };

      expect(config.enableDevMode).toBe(true);
      expect(config.attributes).toEqual({ userId: "123" });
    });
  });
});
