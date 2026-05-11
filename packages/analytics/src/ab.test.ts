import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGrowthBook, GrowthBook } from "./ab";
import type { GrowthBookConfig } from "./types";

// =============================================================================
// Domain Test Values - A/B Testing
// =============================================================================

const AB_DOMAIN = {
  CONFIG: {
    REQUIRED: {
      apiHost: "https://cdn.growthbook.io",
      clientKey: "sdk-abc123",
    },
    ENABLE_DEV_MODE: true,
    ATTRIBUTES: { id: "user-123", browser: "chrome" },
  },

  GROWTHBOOK_INSTANCE: {
    EXPECTED_METHODS: ["init", "destroy"],
  },
} as const;

// =============================================================================
// Mock Setup
// =============================================================================

vi.mock("@growthbook/growthbook", () => {
  return {
    GrowthBook: vi.fn().mockImplementation(function (this: any, config: any) {
      this.apiHost = config.apiHost;
      this.clientKey = config.clientKey;
      this.enableDevMode = config.enableDevMode;
      this.attributes = config.attributes;
    }),
  };
});

// =============================================================================
// Test Suite
// =============================================================================

describe("ab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createGrowthBook", () => {
    it("should create a GrowthBook instance", () => {
      const config: GrowthBookConfig = AB_DOMAIN.CONFIG.REQUIRED;
      const gb = createGrowthBook(config);
      expect(gb).toBeDefined();
    });

    it("should pass apiHost to GrowthBook constructor", () => {
      const config: GrowthBookConfig = AB_DOMAIN.CONFIG.REQUIRED;
      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          apiHost: AB_DOMAIN.CONFIG.REQUIRED.apiHost,
        })
      );
    });

    it("should pass clientKey to GrowthBook constructor", () => {
      const config: GrowthBookConfig = AB_DOMAIN.CONFIG.REQUIRED;
      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          clientKey: AB_DOMAIN.CONFIG.REQUIRED.clientKey,
        })
      );
    });

    it.each([
      { enableDevMode: false, expected: false },
      { enableDevMode: true, expected: true },
    ])(
      "should set enableDevMode to $expected",
      ({ enableDevMode, expected }) => {
        const config: GrowthBookConfig = {
          ...AB_DOMAIN.CONFIG.REQUIRED,
          enableDevMode,
        };

        createGrowthBook(config);

        expect(GrowthBook).toHaveBeenCalledWith(
          expect.objectContaining({
            enableDevMode: expected,
          })
        );
      }
    );

    it("should pass attributes when provided", () => {
      const config: GrowthBookConfig = {
        ...AB_DOMAIN.CONFIG.REQUIRED,
        attributes: AB_DOMAIN.CONFIG.ATTRIBUTES,
      };

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: AB_DOMAIN.CONFIG.ATTRIBUTES,
        })
      );
    });

    it("should not pass attributes when not provided", () => {
      const config: GrowthBookConfig = AB_DOMAIN.CONFIG.REQUIRED;

      createGrowthBook(config);

      expect(GrowthBook).toHaveBeenCalledWith(
        expect.not.objectContaining({
          attributes: expect.anything(),
        })
      );
    });

    it("should create GrowthBook with correct configuration", () => {
      const config: GrowthBookConfig = AB_DOMAIN.CONFIG.REQUIRED;
      const gb = createGrowthBook(config);

      expect(gb).toBeDefined();
      expect(GrowthBook).toHaveBeenCalledTimes(1);
    });
  });

  describe("GrowthBookConfig type export", () => {
    it("should allow creating config with required fields", () => {
      const config: GrowthBookConfig = AB_DOMAIN.CONFIG.REQUIRED;

      expect(config.apiHost).toBe(AB_DOMAIN.CONFIG.REQUIRED.apiHost);
      expect(config.clientKey).toBe(AB_DOMAIN.CONFIG.REQUIRED.clientKey);
    });

    it("should allow creating config with optional fields", () => {
      const config: GrowthBookConfig = {
        ...AB_DOMAIN.CONFIG.REQUIRED,
        enableDevMode: AB_DOMAIN.CONFIG.ENABLE_DEV_MODE,
        attributes: AB_DOMAIN.CONFIG.ATTRIBUTES,
      };

      expect(config.enableDevMode).toBe(AB_DOMAIN.CONFIG.ENABLE_DEV_MODE);
      expect(config.attributes).toEqual(AB_DOMAIN.CONFIG.ATTRIBUTES);
    });
  });
});
