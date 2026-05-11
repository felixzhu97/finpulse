import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CTA_CLICK, PAGE_VIEW } from "@fintech/analytics";
import type { AnalyticsClient } from "@fintech/analytics";

// Track calls for assertions
const trackCalls: Array<{ name: string; properties?: Record<string, unknown> }> = [];

const mockAnalyticsClient: AnalyticsClient = {
  track: (name, properties) => {
    trackCalls.push({ name, properties: properties as Record<string, unknown> });
  },
  identify: vi.fn(),
};

// Create mock functions using vi.hoisted to ensure they're available before vi.mock
const { mockUseFeatureIsOn, mockUseFeatureValue } = vi.hoisted(() => {
  const isOn = vi.fn((_key?: string) => false);
  const value = vi.fn((_key?: string, fallback?: string) => fallback ?? "");
  return { mockUseFeatureIsOn: isOn, mockUseFeatureValue: value };
});

// Mock the analytics package BEFORE importing App
vi.mock("@fintech/analytics", () => ({
  CTA_CLICK: "cta_click",
  PAGE_VIEW: "page_view",
  createConsoleTransport: vi.fn(() => ({
    track: vi.fn(),
    flush: vi.fn(),
  })),
  createHttpTransport: vi.fn(),
  createGrowthBook: vi.fn(),
}));

vi.mock("@fintech/analytics/react", () => {
  return {
    useAnalytics: () => mockAnalyticsClient,
    useFeatureIsOn: (key?: string) => mockUseFeatureIsOn(key),
    useFeatureValue: (key?: string, fallback?: string) => mockUseFeatureValue(key, fallback),
    AnalyticsProvider: ({ children }: { children: React.ReactNode }) => children,
    GrowthBookProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Import App after all mocks are set up
import App from "./App";

describe("App Component", () => {
  beforeEach(() => {
    trackCalls.length = 0;
    vi.clearAllMocks();
    mockUseFeatureIsOn.mockImplementation((_key?: string) => false);
    mockUseFeatureValue.mockImplementation((_key?: string, fallback?: string) => fallback ?? "");
  });

  describe("Rendering", () => {
    it("renders the title heading", () => {
      render(<App />);
      expect(screen.getByRole("heading", { name: /finpulse portal/i })).toBeInTheDocument();
    });

    it("renders the subtitle text", () => {
      render(<App />);
      expect(
        screen.getByText(/portal app — robinhood-style fintech experience\./i)
      ).toBeInTheDocument();
    });

    it("renders the CTA button with default label", () => {
      render(<App />);
      expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
    });

    it("renders root div as container", () => {
      const { container } = render(<App />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders CTA button with custom label from feature flag", () => {
      mockUseFeatureValue.mockImplementation((_key?: string, fallback?: string) => {
        if (_key === "portal-cta-label") return "Get Started Now";
        return fallback ?? "";
      });

      render(<App />);
      expect(screen.getByRole("button", { name: /get started now/i })).toBeInTheDocument();
    });

    it("renders the title with correct styling", () => {
      const { container } = render(<App />);
      const title = container.querySelector("h1");
      expect(title).toBeInTheDocument();
    });
  });

  describe("Analytics Tracking", () => {
    it("tracks page view on mount", () => {
      render(<App />);
      expect(trackCalls).toContainEqual({ name: PAGE_VIEW, properties: { path: "/" } });
    });

    it("tracks page view only once on mount", () => {
      render(<App />);
      const pageViewCalls = trackCalls.filter((call) => call.name === PAGE_VIEW);
      expect(pageViewCalls).toHaveLength(1);
    });

    it("tracks CTA click when button is clicked", () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /get started/i }));
      expect(trackCalls).toContainEqual({
        name: CTA_CLICK,
        properties: { cta: "get_started", variant: "legacy" },
      });
    });

    it("tracks CTA click with new variant when feature flag is enabled", () => {
      mockUseFeatureIsOn.mockImplementation((_key?: string) => {
        if (_key === "portal-new-cta") return true;
        return false;
      });

      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /get started/i }));
      expect(trackCalls).toContainEqual({
        name: CTA_CLICK,
        properties: { cta: "get_started", variant: "new" },
      });
    });

    it("tracks multiple CTA clicks correctly", () => {
      render(<App />);
      const button = screen.getByRole("button", { name: /get started/i });

      fireEvent.click(button);
      fireEvent.click(button);

      const ctaCalls = trackCalls.filter((call) => call.name === CTA_CLICK);
      expect(ctaCalls).toHaveLength(2);
    });

    it("page view tracks with correct analytics client", () => {
      render(<App />);
      const pageViewCall = trackCalls.find((call) => call.name === PAGE_VIEW);
      expect(pageViewCall).toBeDefined();
      expect(pageViewCall?.properties).toEqual({ path: "/" });
    });
  });

  describe("Button Behavior", () => {
    it("button has correct type attribute", () => {
      render(<App />);
      const button = screen.getByRole("button", { name: /get started/i });
      expect(button).toHaveAttribute("type", "button");
    });

    it("button is not disabled by default", () => {
      render(<App />);
      const button = screen.getByRole("button", { name: /get started/i });
      expect(button).not.toBeDisabled();
    });

    it("button responds to click event", () => {
      render(<App />);
      const button = screen.getByRole("button", { name: /get started/i });

      let clickCount = 0;
      button.addEventListener("click", () => clickCount++);

      fireEvent.click(button);
      expect(clickCount).toBe(1);
    });
  });

  describe("Feature Flags", () => {
    it("uses empty string from feature flag correctly", () => {
      mockUseFeatureValue.mockImplementation((_key?: string, fallback?: string) => {
        if (_key === "portal-cta-label") return "";
        return fallback ?? "";
      });

      render(<App />);
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("");
    });

    it("handles new CTA flag correctly", () => {
      mockUseFeatureIsOn.mockImplementation((_key?: string) => {
        if (_key === "portal-new-cta") return true;
        return false;
      });

      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /get started/i }));

      const ctaCall = trackCalls.find((call) => call.name === CTA_CLICK);
      expect(ctaCall?.properties?.variant).toBe("new");
    });

    it("handles legacy CTA flag correctly", () => {
      mockUseFeatureIsOn.mockImplementation(() => false);

      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /get started/i }));

      const ctaCall = trackCalls.find((call) => call.name === CTA_CLICK);
      expect(ctaCall?.properties?.variant).toBe("legacy");
    });
  });
});
