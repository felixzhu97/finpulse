/**
 * Quotes Selectors Tests - TDD Optimized
 * Following TDD Best Practices: AAA Pattern, Domain Values, Factory Functions, Boundary Testing
 */
import type { RootState } from "../storeInstance";
import {
  selectStatus,
  selectSubscribedSymbols,
  selectExtraSubscribedSymbols,
  selectMergedSubscribedSymbols,
  selectQuotesForSymbols,
  selectHistoryForSymbols,
} from "../quotesSelectors";
import type { QuoteSnapshot, QuoteConnectionStatus } from "@/src/types/quotes";

/**
 * Domain Test Values - Standardized test data for quotes selectors
 */
const DOMAIN_VALUES = {
  SYMBOLS: {
    VALID: ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN", "META", "NVDA", "BTC", "ETH"],
    EDGE_CASES: {
      LOWERCASE: ["aapl", "googl"],
      MIXED_CASE: ["AaPl", "gOoGl"],
      SINGLE: ["TSLA"],
      EMPTY: [] as string[],
    },
  },
  QUOTE: {
    VALID: {
      price: 175.5,
      change: 2.5,
      changeRate: 0.0145,
      volume: 1000000,
      timestamp: 1704067200000,
    },
    EDGE_CASES: {
      ZERO: { price: 0, change: 0, changeRate: 0, volume: 0, timestamp: 0 },
      NEGATIVE: { price: -10, change: -1, changeRate: -0.05, volume: 100, timestamp: 0 },
    },
  },
  HISTORY: {
    VALID: [170, 172, 174, 175, 175.5],
    EDGE_CASES: {
      SINGLE: [100],
      EMPTY: [] as number[],
    },
  },
  STATUS: {
    ALL: ["idle", "connecting", "open", "closed", "error"] as QuoteConnectionStatus[],
  },
} as const;

/**
 * Factory function for creating test QuoteSnapshot
 */
const createQuoteSnapshot = (
  overrides: Partial<Record<string, { price: number; change: number; changeRate: number; volume?: number; timestamp: number }>> = {}
): QuoteSnapshot => {
  const defaultQuote = { ...DOMAIN_VALUES.QUOTE.VALID };
  const snapshot: QuoteSnapshot = {};
  for (const [symbol, data] of Object.entries(overrides)) {
    snapshot[symbol] = { ...defaultQuote, ...data };
  }
  return snapshot;
};

/**
 * Factory function for creating test history
 */
const createHistory = (overrides: Record<string, number[]> = {}): Record<string, number[]> => ({
  ...overrides,
});

/**
 * Factory function for creating a complete mock RootState
 */
const createMockState = (
  quotesOverrides?: {
    quotes?: QuoteSnapshot;
    history?: Record<string, number[]>;
    status?: QuoteConnectionStatus;
    subscribedSymbols?: string[];
    extraSubscribedSymbols?: string[];
  }
): RootState => ({
  quotes: {
    quotes: quotesOverrides?.quotes || {},
    history: quotesOverrides?.history || {},
    historyLoaded: false,
    status: (quotesOverrides?.status || "idle") as QuoteConnectionStatus,
    subscribedSymbols: quotesOverrides?.subscribedSymbols || [],
    extraSubscribedSymbols: quotesOverrides?.extraSubscribedSymbols || [],
  },
  auth: { token: null, customer: null, restored: false },
  portfolio: { selectedAccountId: null },
  web3: {
    walletInfo: null,
    loading: false,
    error: null,
  },
  preferences: {
    theme: "dark",
    language: "en",
    notificationsEnabled: true,
    isLoading: false,
    lastUpdated: null,
  },
} as unknown as RootState);

describe("quotesSelectors", () => {
  describe("selectStatus", () => {
    describe("when selecting status", () => {
      it.each(DOMAIN_VALUES.STATUS.ALL)(
        "should return %s status",
        (status) => {
          // Arrange
          const state = createMockState({ status });

          // Act
          const result = selectStatus(state);

          // Assert
          expect(result).toBe(status);
        }
      );
    });

    describe("boundary value testing", () => {
      it("should return idle for uninitialized state", () => {
        // Arrange
        const state = createMockState({ status: "idle" });

        // Act
        const result = selectStatus(state);

        // Assert
        expect(result).toBe("idle");
      });
    });
  });

  describe("selectSubscribedSymbols", () => {
    describe("when selecting subscribed symbols", () => {
      it("should return empty array when no symbols", () => {
        // Arrange
        const state = createMockState({ subscribedSymbols: [] });

        // Act
        const result = selectSubscribedSymbols(state);

        // Assert
        expect(result).toEqual([]);
      });

      it("should return subscribed symbols", () => {
        // Arrange
        const symbols = ["AAPL", "GOOGL"];
        const state = createMockState({ subscribedSymbols: symbols });

        // Act
        const result = selectSubscribedSymbols(state);

        // Assert
        expect(result).toEqual(symbols);
      });

      it("should preserve symbol order", () => {
        // Arrange
        const symbols = ["MSFT", "AMZN", "META", "NVDA"];
        const state = createMockState({ subscribedSymbols: symbols });

        // Act
        const result = selectSubscribedSymbols(state);

        // Assert
        expect(result).toEqual(symbols);
      });
    });

    describe("boundary value testing", () => {
      it.each(DOMAIN_VALUES.SYMBOLS.VALID)(
        "should handle single symbol: %s",
        (symbol) => {
          // Arrange
          const state = createMockState({ subscribedSymbols: [symbol] });

          // Act
          const result = selectSubscribedSymbols(state);

          // Assert
          expect(result).toEqual([symbol]);
        }
      );
    });
  });

  describe("selectExtraSubscribedSymbols", () => {
    describe("when selecting extra subscribed symbols", () => {
      it("should return empty array when no extra symbols", () => {
        // Arrange
        const state = createMockState({ extraSubscribedSymbols: [] });

        // Act
        const result = selectExtraSubscribedSymbols(state);

        // Assert
        expect(result).toEqual([]);
      });

      it("should return extra subscribed symbols", () => {
        // Arrange
        const symbols = ["BTC", "ETH"];
        const state = createMockState({ extraSubscribedSymbols: symbols });

        // Act
        const result = selectExtraSubscribedSymbols(state);

        // Assert
        expect(result).toEqual(symbols);
      });
    });
  });

  describe("selectMergedSubscribedSymbols", () => {
    describe("when merging symbols", () => {
      it("should return empty array when both are empty", () => {
        // Arrange
        const state = createMockState({
          subscribedSymbols: [],
          extraSubscribedSymbols: [],
        });

        // Act
        const result = selectMergedSubscribedSymbols(state);

        // Assert
        expect(result).toEqual([]);
      });

      it("should merge main and extra symbols", () => {
        // Arrange
        const state = createMockState({
          subscribedSymbols: ["AAPL", "GOOGL"],
          extraSubscribedSymbols: ["BTC", "ETH"],
        });

        // Act
        const result = selectMergedSubscribedSymbols(state);

        // Assert
        expect(result).toContain("AAPL");
        expect(result).toContain("GOOGL");
        expect(result).toContain("BTC");
        expect(result).toContain("ETH");
        expect(result).toHaveLength(4);
      });

      it("should deduplicate symbols", () => {
        // Arrange
        const state = createMockState({
          subscribedSymbols: ["AAPL", "BTC"],
          extraSubscribedSymbols: ["BTC", "ETH"],
        });

        // Act
        const result = selectMergedSubscribedSymbols(state);

        // Assert
        expect(result).toHaveLength(3);
        const btcCount = result.filter((s) => s === "BTC").length;
        expect(btcCount).toBe(1);
      });

      it("should return only main symbols when extra is empty", () => {
        // Arrange
        const state = createMockState({
          subscribedSymbols: ["AAPL", "GOOGL"],
          extraSubscribedSymbols: [],
        });

        // Act
        const result = selectMergedSubscribedSymbols(state);

        // Assert
        expect(result).toEqual(["AAPL", "GOOGL"]);
      });

      it("should return only extra symbols when main is empty", () => {
        // Arrange
        const state = createMockState({
          subscribedSymbols: [],
          extraSubscribedSymbols: ["BTC", "ETH"],
        });

        // Act
        const result = selectMergedSubscribedSymbols(state);

        // Assert
        expect(result).toEqual(["BTC", "ETH"]);
      });
    });

    describe("boundary value testing", () => {
      it("should handle large symbol sets", () => {
        // Arrange
        const mainSymbols = Array.from({ length: 20 }, (_, i) => `SYM${i}`);
        const extraSymbols = Array.from({ length: 10 }, (_, i) => `CRYPTO${i}`);
        const state = createMockState({
          subscribedSymbols: mainSymbols,
          extraSubscribedSymbols: extraSymbols,
        });

        // Act
        const result = selectMergedSubscribedSymbols(state);

        // Assert
        expect(result).toHaveLength(30);
      });

      it("should handle complete overlap", () => {
        // Arrange
        const symbols = ["AAPL", "GOOGL"];
        const state = createMockState({
          subscribedSymbols: symbols,
          extraSubscribedSymbols: symbols,
        });

        // Act
        const result = selectMergedSubscribedSymbols(state);

        // Assert
        expect(result).toHaveLength(2);
      });
    });
  });

  describe("selectQuotesForSymbols", () => {
    describe("when selecting quotes", () => {
      it("should return empty object when no quotes", () => {
        // Arrange
        const state = createMockState({ quotes: {} });

        // Act
        const result = selectQuotesForSymbols(state, ["AAPL"]);

        // Assert
        expect(result).toEqual({});
      });

      it("should return quotes for matching symbols", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
          GOOGL: { ...DOMAIN_VALUES.QUOTE.VALID, price: 140.0, change: 1.0, changeRate: 0.0072, volume: 500000, timestamp: Date.now() },
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, ["AAPL", "GOOGL"]);

        // Assert
        expect(result.AAPL).toBeDefined();
        expect(result.GOOGL).toBeDefined();
        expect(result.AAPL.price).toBe(175.5);
        expect(result.GOOGL.price).toBe(140.0);
      });

      it("should not include quotes for symbols not in list", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
          GOOGL: { ...DOMAIN_VALUES.QUOTE.VALID, price: 140.0, change: 1.0, changeRate: 0.0072, volume: 500000, timestamp: Date.now() },
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL).toBeDefined();
        expect(result.GOOGL).toBeUndefined();
      });

      it("should return empty object for non-existent symbols", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, ["TSLA", "MSFT"]);

        // Assert
        expect(result).toEqual({});
      });

      it("should handle empty symbol list", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, []);

        // Assert
        expect(result).toEqual({});
      });

      it("should include all properties of quote", () => {
        // Arrange
        const timestamp = Date.now();
        const quotes = createQuoteSnapshot({
          AAPL: {
            price: 175.5,
            change: 2.5,
            changeRate: 0.0145,
            volume: 1000000,
            timestamp,
          },
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL).toEqual({
          price: 175.5,
          change: 2.5,
          changeRate: 0.0145,
          volume: 1000000,
          timestamp,
        });
      });
    });

    describe("when normalizing symbol keys", () => {
      it("should convert lowercase symbols to uppercase", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, ["aapl"]);

        // Assert
        expect(result.AAPL).toBeDefined();
        expect(result.aapl).toBeUndefined();
      });

      it("should handle mixed case symbols", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, ["AaPl"]);

        // Assert
        expect(result.AAPL).toBeDefined();
      });
    });

    describe("boundary value testing", () => {
      it("should handle large symbol list", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
        });
        const state = createMockState({ quotes });
        const largeSymbolList = Array.from({ length: 100 }, (_, i) => `SYM${i}`);
        largeSymbolList[0] = "AAPL";

        // Act
        const result = selectQuotesForSymbols(state, largeSymbolList);

        // Assert
        expect(result.AAPL).toBeDefined();
        expect(Object.keys(result)).toHaveLength(1);
      });

      it("should handle zero price quotes", () => {
        // Arrange
        const quotes = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.EDGE_CASES.ZERO,
        });
        const state = createMockState({ quotes });

        // Act
        const result = selectQuotesForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL.price).toBe(0);
      });
    });
  });

  describe("selectHistoryForSymbols", () => {
    describe("when selecting history", () => {
      it("should return empty object when no history", () => {
        // Arrange
        const state = createMockState({ history: {} });

        // Act
        const result = selectHistoryForSymbols(state, ["AAPL"]);

        // Assert
        expect(result).toEqual({});
      });

      it("should return history for matching symbols", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.VALID,
          GOOGL: [140, 141, 142, 142.5],
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["AAPL", "GOOGL"]);

        // Assert
        expect(result.AAPL).toEqual(DOMAIN_VALUES.HISTORY.VALID);
        expect(result.GOOGL).toEqual([140, 141, 142, 142.5]);
      });

      it("should not include history for symbols not in list", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.VALID,
          GOOGL: [140, 141, 142],
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL).toEqual(DOMAIN_VALUES.HISTORY.VALID);
        expect(result.GOOGL).toBeUndefined();
      });

      it("should return empty object for non-existent symbols", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.VALID,
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["TSLA", "MSFT"]);

        // Assert
        expect(result).toEqual({});
      });

      it("should handle empty symbol list", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.VALID,
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, []);

        // Assert
        expect(result).toEqual({});
      });

      it("should preserve array values exactly", () => {
        // Arrange
        const history = createHistory({
          AAPL: [100.5, 101.2, 102.8],
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL).toHaveLength(3);
        expect(result.AAPL![0]).toBe(100.5);
        expect(result.AAPL![1]).toBe(101.2);
        expect(result.AAPL![2]).toBe(102.8);
      });
    });

    describe("when normalizing symbol keys", () => {
      it("should convert lowercase symbols to uppercase", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.VALID,
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["aapl"]);

        // Assert
        expect(result.AAPL).toEqual(DOMAIN_VALUES.HISTORY.VALID);
        expect(result.aapl).toBeUndefined();
      });
    });

    describe("boundary value testing", () => {
      it("should handle single value history", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.EDGE_CASES.SINGLE,
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL).toEqual([100]);
      });

      it("should handle large history arrays", () => {
        // Arrange
        const largeHistory = Array.from({ length: 1000 }, (_, i) => i);
        const history = createHistory({ AAPL: largeHistory });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL).toHaveLength(1000);
      });

      it("should handle decimal price values", () => {
        // Arrange
        const history = createHistory({
          AAPL: [0.01, 0.02, 0.015],
        });
        const state = createMockState({ history });

        // Act
        const result = selectHistoryForSymbols(state, ["AAPL"]);

        // Assert
        expect(result.AAPL).toEqual([0.01, 0.02, 0.015]);
      });
    });
  });
});
