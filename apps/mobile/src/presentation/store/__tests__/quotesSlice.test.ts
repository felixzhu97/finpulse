/**
 * Quotes Slice Tests - TDD Optimized
 * Following TDD Best Practices: AAA Pattern, Domain Values, Factory Functions, Boundary Testing
 */
import * as quotesSliceModule from "../../../presentation/store/quotesSlice";
import type { QuoteSnapshot, QuoteConnectionStatus } from "@/src/domain/entities/quotes";

const {
  quotesSlice,
  setSubscribedSymbols,
  setSnapshot,
  setStatus,
  setHistory,
  setExtraSubscribedSymbols,
} = quotesSliceModule;

/**
 * Domain Test Values - Standardized test data for quotes slice
 */
const DOMAIN_VALUES = {
  // Stock symbols
  SYMBOLS: {
    VALID: ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN", "META", "NVDA", "BTC", "ETH"],
    EDGE_CASES: {
      LOWERCASE: ["aapl", "googl", "tsla"],
      MIXED_CASE: ["AaPl", "gOoGl", "TsLa"],
      SINGLE_CHAR: ["A", "B", "C"],
      WITH_NUMBERS: ["AAPL1", "BTC2"],
    },
  },
  // Quote data
  QUOTE: {
    VALID: {
      price: 175.5,
      change: 2.5,
      changeRate: 0.0145,
      volume: 1000000,
      timestamp: 1704067200000,
    },
    EDGE_CASES: {
      ZERO_PRICE: { price: 0, change: 0, changeRate: 0, volume: 0, timestamp: 0 },
      NEGATIVE_PRICE: { price: -10, change: -1, changeRate: -0.05, volume: 100, timestamp: 0 },
      LARGE_VOLUME: { price: 100, change: 10, changeRate: 0.1, volume: 9999999999, timestamp: 0 },
      SMALL_PRICE: { price: 0.01, change: 0.001, changeRate: 0.1, volume: 100, timestamp: 0 },
    },
  },
  // Connection status
  STATUS: {
    ALL: ["idle", "connecting", "open", "closed", "error"] as QuoteConnectionStatus[],
  },
  // History constants
  MAX_HISTORY_POINTS: 45,
  HISTORY: {
    SHORT: [170, 172, 174],
    MEDIUM: [170, 172, 174, 175, 175.5],
    LONG: Array.from({ length: 100 }, (_, i) => 100 + i),
    EDGE_44: Array.from({ length: 44 }, (_, i) => 100 + i),
    EDGE_45: Array.from({ length: 45 }, (_, i) => 100 + i),
    EDGE_46: Array.from({ length: 46 }, (_, i) => 100 + i),
  },
} as const;

/**
 * Factory function for creating test QuoteSnapshot
 */
const createQuoteSnapshot = (
  overrides: Partial<Record<string, { price: number; change: number; changeRate: number; volume?: number; timestamp: number }>> = {}
): QuoteSnapshot => {
  const defaultQuote = { ...DOMAIN_VALUES.QUOTE.VALID };
  if (overrides.default) {
    Object.assign(defaultQuote, overrides.default);
    delete overrides.default;
  }
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
 * Factory function for creating test quotes state
 */
const createQuotesState = (overrides: {
  quotes?: QuoteSnapshot;
  history?: Record<string, number[]>;
  historyLoaded?: boolean;
  status?: QuoteConnectionStatus;
  subscribedSymbols?: string[];
  extraSubscribedSymbols?: string[];
} = {}) => ({
  quotes: {},
  history: {},
  historyLoaded: false,
  status: "idle" as QuoteConnectionStatus,
  subscribedSymbols: [] as string[],
  extraSubscribedSymbols: [] as string[],
  ...overrides,
});

describe("quotesSlice", () => {
  // Shared fixture - initial state
  let initialState: ReturnType<typeof quotesSlice.getInitialState>;

  beforeEach(() => {
    initialState = quotesSlice.getInitialState();
  });

  describe("initial state", () => {
    it("should have empty quotes object", () => {
      expect(initialState.quotes).toEqual({});
    });

    it("should have empty history object", () => {
      expect(initialState.history).toEqual({});
    });

    it("should have historyLoaded as false", () => {
      expect(initialState.historyLoaded).toBe(false);
    });

    it("should have idle status", () => {
      expect(initialState.status).toBe("idle");
    });

    it("should have empty subscribedSymbols array", () => {
      expect(initialState.subscribedSymbols).toEqual([]);
    });

    it("should have empty extraSubscribedSymbols array", () => {
      expect(initialState.extraSubscribedSymbols).toEqual([]);
    });
  });

  describe("setSubscribedSymbols action", () => {
    describe("when setting symbols", () => {
      it("should set subscribed symbols", () => {
        // Arrange
        const symbols = ["AAPL", "GOOGL"];

        // Act
        const action = setSubscribedSymbols(symbols);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.subscribedSymbols).toContain("AAPL");
        expect(state.subscribedSymbols).toContain("GOOGL");
      });
    });

    describe("when normalizing symbols", () => {
      it("should convert symbols to uppercase", () => {
        // Arrange
        const symbols = ["aapl", "googl"];

        // Act
        const action = setSubscribedSymbols(symbols);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.subscribedSymbols).toContain("AAPL");
        expect(state.subscribedSymbols).toContain("GOOGL");
      });

      it("should handle mixed case symbols", () => {
        // Arrange
        const symbols = ["AaPl", "gOoGl", "TsLa"];

        // Act
        const action = setSubscribedSymbols(symbols);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.subscribedSymbols).toEqual(["AAPL", "GOOGL", "TSLA"]);
      });
    });

    describe("when deduplicating symbols", () => {
      it("should deduplicate symbols", () => {
        // Arrange
        const symbols = ["AAPL", "aapl", "AAPL"];

        // Act
        const action = setSubscribedSymbols(symbols);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.subscribedSymbols).toHaveLength(1);
        expect(state.subscribedSymbols[0]).toBe("AAPL");
      });
    });

    describe("boundary value testing", () => {
      it.each(DOMAIN_VALUES.SYMBOLS.VALID)(
        "should handle valid symbol: %s",
        (symbol) => {
          // Act
          const action = setSubscribedSymbols([symbol]);
          const state = quotesSlice.reducer(initialState, action);

          // Assert
          expect(state.subscribedSymbols).toContain(symbol);
        }
      );

      it.each(DOMAIN_VALUES.SYMBOLS.EDGE_CASES.MIXED_CASE)(
        "should normalize mixed case: %s -> uppercase",
        (symbol) => {
          // Act
          const action = setSubscribedSymbols([symbol]);
          const state = quotesSlice.reducer(initialState, action);

          // Assert
          expect(state.subscribedSymbols).toContain(symbol.toUpperCase());
        }
      );

      it.each(DOMAIN_VALUES.SYMBOLS.EDGE_CASES.SINGLE_CHAR)(
        "should handle single character symbol: %s",
        (symbol) => {
          // Act
          const action = setSubscribedSymbols([symbol]);
          const state = quotesSlice.reducer(initialState, action);

          // Assert
          expect(state.subscribedSymbols).toContain(symbol.toUpperCase());
        }
      );
    });
  });

  describe("setSnapshot action", () => {
    describe("when setting quotes snapshot", () => {
      it("should set quotes snapshot", () => {
        // Arrange
        const snapshot = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
        });

        // Act
        const action = setSnapshot(snapshot);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.quotes.AAPL.price).toBe(DOMAIN_VALUES.QUOTE.VALID.price);
        expect(state.quotes.AAPL.change).toBe(DOMAIN_VALUES.QUOTE.VALID.change);
      });
    });

    describe("when normalizing symbol keys", () => {
      it("should convert symbol keys to uppercase", () => {
        // Arrange
        const snapshot = createQuoteSnapshot({
          aapl: DOMAIN_VALUES.QUOTE.VALID,
        });

        // Act
        const action = setSnapshot(snapshot);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.quotes.AAPL).toBeDefined();
        expect(state.quotes.aapl).toBeUndefined();
      });
    });

    describe("when managing history", () => {
      it("should initialize history for new symbols", () => {
        // Arrange
        const snapshot = createQuoteSnapshot({
          AAPL: DOMAIN_VALUES.QUOTE.VALID,
        });

        // Act
        const action = setSnapshot(snapshot);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toBeDefined();
        expect(state.history.AAPL).toContain(DOMAIN_VALUES.QUOTE.VALID.price);
      });

      it("should append to existing history", () => {
        // Arrange
        const stateWithHistory = createQuotesState({
          history: { AAPL: [170, 172, 174] },
        });
        const newPrice = 175.5;
        const snapshot = createQuoteSnapshot({
          AAPL: { ...DOMAIN_VALUES.QUOTE.VALID, price: newPrice },
        });

        // Act
        const action = setSnapshot(snapshot);
        const state = quotesSlice.reducer(stateWithHistory, action);

        // Assert
        expect(state.history.AAPL).toContain(newPrice);
        expect(state.history.AAPL).toHaveLength(4);
      });

      it("should not duplicate consecutive same prices", () => {
        // Arrange
        const samePrice = 175.5;
        const stateWithHistory = createQuotesState({
          history: { AAPL: [samePrice] },
        });
        const snapshot = createQuoteSnapshot({
          AAPL: { ...DOMAIN_VALUES.QUOTE.VALID, price: samePrice },
        });

        // Act
        const action = setSnapshot(snapshot);
        const state = quotesSlice.reducer(stateWithHistory, action);

        // Assert
        expect(state.history.AAPL).toHaveLength(1);
      });
    });

    describe("boundary value testing", () => {
      it.each([
        { desc: "zero price", quote: DOMAIN_VALUES.QUOTE.EDGE_CASES.ZERO_PRICE },
        { desc: "negative price", quote: DOMAIN_VALUES.QUOTE.EDGE_CASES.NEGATIVE_PRICE },
        { desc: "small price", quote: DOMAIN_VALUES.QUOTE.EDGE_CASES.SMALL_PRICE },
      ])("should handle $desc", ({ quote }) => {
        // Arrange
        const snapshot = createQuoteSnapshot({ AAPL: quote });

        // Act
        const action = setSnapshot(snapshot);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.quotes.AAPL.price).toBe(quote.price);
      });
    });
  });

  describe("setStatus action", () => {
    describe("when setting status", () => {
      it.each(DOMAIN_VALUES.STATUS.ALL)(
        "should set status to %s",
        (status) => {
          // Act
          const action = setStatus(status);
          const state = quotesSlice.reducer(initialState, action);

          // Assert
          expect(state.status).toBe(status);
        }
      );
    });

    describe("when transitioning through status lifecycle", () => {
      it("should transition through status lifecycle", () => {
        // Arrange & Act & Assert
        let state = quotesSlice.reducer(initialState, setStatus("connecting"));
        expect(state.status).toBe("connecting");

        state = quotesSlice.reducer(state, setStatus("open"));
        expect(state.status).toBe("open");

        state = quotesSlice.reducer(state, setStatus("closed"));
        expect(state.status).toBe("closed");
      });
    });
  });

  describe("setHistory action", () => {
    describe("when setting history", () => {
      it("should set history and mark as loaded", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.MEDIUM,
          GOOGL: [140, 141, 142, 142.5],
        });

        // Act
        const action = setHistory(history);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.historyLoaded).toBe(true);
        expect(state.history.AAPL).toEqual(DOMAIN_VALUES.HISTORY.MEDIUM);
      });

      it("should convert symbol keys to uppercase", () => {
        // Arrange
        const history = createHistory({
          aapl: DOMAIN_VALUES.HISTORY.SHORT,
          googl: [140, 141, 142],
        });

        // Act
        const action = setHistory(history);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toBeDefined();
        expect(state.history.GOOGL).toBeDefined();
      });
    });

    describe("when limiting history points", () => {
      it("should limit history to max 45 points", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.LONG,
        });

        // Act
        const action = setHistory(history);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toHaveLength(DOMAIN_VALUES.MAX_HISTORY_POINTS);
        expect(state.history.AAPL[0]).toBe(155);
      });

      it("should keep last 45 points from long history (46 items)", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.EDGE_46,
        });

        // Act
        const action = setHistory(history);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toHaveLength(DOMAIN_VALUES.MAX_HISTORY_POINTS);
        expect(state.history.AAPL[0]).toBe(101);
      });

      it("should keep all points when exactly 45", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.EDGE_45,
        });

        // Act
        const action = setHistory(history);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toHaveLength(DOMAIN_VALUES.MAX_HISTORY_POINTS);
      });

      it("should keep all points when under 45", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.EDGE_44,
        });

        // Act
        const action = setHistory(history);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toHaveLength(44);
      });
    });

    describe("when filtering empty arrays", () => {
      it("should ignore empty arrays", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.MEDIUM,
          GOOGL: [],
        });

        // Act
        const action = setHistory(history);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toHaveLength(5);
        expect(state.history.GOOGL).toBeUndefined();
      });

      it("should ignore undefined arrays", () => {
        // Arrange
        const history = createHistory({
          AAPL: DOMAIN_VALUES.HISTORY.MEDIUM,
          GOOGL: undefined,
        } as Record<string, number[] | undefined>);

        // Act
        const action = setHistory(history as Record<string, number[]>);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.history.AAPL).toHaveLength(5);
        expect(state.history.GOOGL).toBeUndefined();
      });
    });
  });

  describe("setExtraSubscribedSymbols action", () => {
    describe("when setting extra symbols", () => {
      it("should set extra subscribed symbols", () => {
        // Arrange
        const symbols = ["BTC", "ETH"];

        // Act
        const action = setExtraSubscribedSymbols(symbols);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.extraSubscribedSymbols).toContain("BTC");
        expect(state.extraSubscribedSymbols).toContain("ETH");
      });

      it("should convert symbols to uppercase", () => {
        // Arrange
        const symbols = ["btc", "eth"];

        // Act
        const action = setExtraSubscribedSymbols(symbols);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.extraSubscribedSymbols).toContain("BTC");
        expect(state.extraSubscribedSymbols).toContain("ETH");
      });
    });

    describe("when filtering symbols", () => {
      it("should filter out empty strings", () => {
        // Arrange
        const symbols = ["BTC", "", "ETH", ""];

        // Act
        const action = setExtraSubscribedSymbols(symbols);
        const state = quotesSlice.reducer(initialState, action);

        // Assert
        expect(state.extraSubscribedSymbols).toHaveLength(2);
        expect(state.extraSubscribedSymbols).not.toContain("");
      });
    });
  });
});
