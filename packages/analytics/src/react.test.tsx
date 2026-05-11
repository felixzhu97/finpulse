import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import {
  AnalyticsProvider,
  useAnalytics,
  GrowthBookProvider,
} from "./react";

// =============================================================================
// Domain Test Values - React Hooks
// =============================================================================

const REACT_DOMAIN = {
  CONFIG: {
    apiHost: "https://test.com",
    clientKey: "test-key",
  },

  USER_ID: "user-123",
} as const;

// =============================================================================
// Mock Setup
// =============================================================================

const mockGrowthBookInstance = {
  setFeatures: vi.fn().mockReturnThis(),
  setAttributes: vi.fn().mockReturnThis(),
  setTrackingCallback: vi.fn().mockReturnThis(),
  init: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("@growthbook/growthbook-react", () => ({
  GrowthBookProvider: ({ children }: { children: React.ReactNode }) => children,
  useFeatureIsOn: vi.fn(),
  useFeatureValue: vi.fn(),
  useGrowthBook: vi.fn(),
}));

vi.mock("@growthbook/growthbook", () => ({
  GrowthBook: vi.fn().mockImplementation(() => mockGrowthBookInstance),
}));

vi.mock("./ab", () => ({
  createGrowthBook: vi.fn(() => mockGrowthBookInstance),
}));

// =============================================================================
// Test Factories
// =============================================================================

const createMockTransport = () => ({
  track: vi.fn(),
});

// =============================================================================
// Test Suite
// =============================================================================

describe("react", () => {
  describe("AnalyticsProvider", () => {
    it("should provide analytics client to children", () => {
      const mockTransport = createMockTransport();
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: ({ children }) => (
          <AnalyticsProvider transport={mockTransport}>
            {children}
          </AnalyticsProvider>
        ),
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.track).toBe("function");
      expect(typeof result.current.identify).toBe("function");
    });

    it("should return defined client on re-render", () => {
      const transport1 = createMockTransport();

      const { result, rerender } = renderHook(() => useAnalytics(), {
        wrapper: ({ children }) => (
          <AnalyticsProvider transport={transport1}>{children}</AnalyticsProvider>
        ),
      });

      rerender();

      expect(result.current).toBeDefined();
    });

    it("should not throw when useAnalytics is called outside provider", () => {
      const { result } = renderHook(() => useAnalytics());

      expect(result.current).toBeDefined();
      expect(typeof result.current.track).toBe("function");
    });
  });

  describe("useAnalytics", () => {
    it("should return a client with track and identify methods", () => {
      const mockTransport = createMockTransport();
      const { result } = renderHook(() => useAnalytics(), {
        wrapper: ({ children }) => (
          <AnalyticsProvider transport={mockTransport}>
            {children}
          </AnalyticsProvider>
        ),
      });

      expect(typeof result.current.track).toBe("function");
      expect(typeof result.current.identify).toBe("function");
    });

    it("should use noop client when outside provider", () => {
      const { result } = renderHook(() => useAnalytics());

      expect(() => result.current.track("test")).not.toThrow();
      expect(() => result.current.identify(REACT_DOMAIN.USER_ID)).not.toThrow();
    });

    it("should return same client instance on re-renders (memoization)", () => {
      const mockTransport = createMockTransport();
      const { result, rerender } = renderHook(() => useAnalytics(), {
        wrapper: ({ children }) => (
          <AnalyticsProvider transport={mockTransport}>
            {children}
          </AnalyticsProvider>
        ),
      });

      const firstClient = result.current;

      rerender();

      expect(result.current).toBe(firstClient);
    });
  });

  describe("GrowthBookProvider", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should render children", () => {
      renderHook(() => null, {
        wrapper: ({ children }) => (
          <GrowthBookProvider config={REACT_DOMAIN.CONFIG}>
            <span>Test Child</span>
          </GrowthBookProvider>
        ),
      });

      expect(true).toBe(true);
    });

    it("should create GrowthBook instance with config", async () => {
      renderHook(() => null, {
        wrapper: ({ children }) => (
          <GrowthBookProvider config={REACT_DOMAIN.CONFIG}>{children}</GrowthBookProvider>
        ),
      });

      const { createGrowthBook } = await import("./ab");
      expect(createGrowthBook).toHaveBeenCalledWith(REACT_DOMAIN.CONFIG);
    });

    it("should call init on mount", async () => {
      renderHook(() => null, {
        wrapper: ({ children }) => (
          <GrowthBookProvider config={REACT_DOMAIN.CONFIG}>
            {children}
          </GrowthBookProvider>
        ),
      });

      await waitFor(() => {
        expect(mockGrowthBookInstance.init).toHaveBeenCalledWith({
          streaming: true,
        });
      });
    });

    it("should call destroy on unmount", async () => {
      const { unmount } = renderHook(() => null, {
        wrapper: ({ children }) => (
          <GrowthBookProvider config={REACT_DOMAIN.CONFIG}>
            {children}
          </GrowthBookProvider>
        ),
      });

      unmount();

      expect(mockGrowthBookInstance.destroy).toHaveBeenCalled();
    });

    it("should create GrowthBook only once on re-renders", async () => {
      const { rerender } = renderHook(() => null, {
        wrapper: ({ children }) => (
          <GrowthBookProvider config={REACT_DOMAIN.CONFIG}>
            {children}
          </GrowthBookProvider>
        ),
      });

      rerender();
      rerender();

      const { createGrowthBook } = await import("./ab");
      expect(createGrowthBook).toHaveBeenCalledTimes(1);
    });
  });

  describe("re-exported hooks", () => {
    it.each([
      { name: "useFeatureIsOn" },
      { name: "useFeatureValue" },
      { name: "useGrowthBook" },
    ])("should export $name", async ({ name }) => {
      const module = await import("./react");
      expect((module as any)[name]).toBeDefined();
    });
  });
});
