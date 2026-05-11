import type { RootState } from "../storeInstance";
import {
  selectStatus,
  selectSubscribedSymbols,
  selectExtraSubscribedSymbols,
  selectMergedSubscribedSymbols,
  selectQuotesForSymbols,
  selectHistoryForSymbols,
} from "../quotesSelectors";
import type { QuoteSnapshot } from "@/src/domain/entities/quotes";

describe("quotesSelectors", () => {
  const createMockState = (overrides?: Partial<{
    quotes: QuoteSnapshot;
    history: Record<string, number[]>;
    status: string;
    subscribedSymbols: string[];
    extraSubscribedSymbols: string[];
  }>): RootState => {
    return {
      quotes: {
        quotes: overrides?.quotes || {},
        history: overrides?.history || {},
        historyLoaded: false,
        status: (overrides?.status || "idle") as "idle" | "connecting" | "open" | "closed" | "error",
        subscribedSymbols: overrides?.subscribedSymbols || [],
        extraSubscribedSymbols: overrides?.extraSubscribedSymbols || [],
      },
      auth: { token: null, customer: null, restored: false },
      portfolio: { portfolio: null, positions: [], status: "idle", error: null },
      web3: {
        address: null,
        chainId: null,
        isConnecting: false,
        balance: null,
        transactions: [],
      },
      preferences: {
        theme: "dark",
        language: "en",
        notificationsEnabled: true,
        isLoading: false,
        lastUpdated: null,
      },
    } as RootState;
  };

  describe("selectStatus", () => {
    it("should return idle status", () => {
      const state = createMockState({ status: "idle" });
      expect(selectStatus(state)).toBe("idle");
    });

    it("should return connecting status", () => {
      const state = createMockState({ status: "connecting" });
      expect(selectStatus(state)).toBe("connecting");
    });

    it("should return open status", () => {
      const state = createMockState({ status: "open" });
      expect(selectStatus(state)).toBe("open");
    });

    it("should return closed status", () => {
      const state = createMockState({ status: "closed" });
      expect(selectStatus(state)).toBe("closed");
    });

    it("should return error status", () => {
      const state = createMockState({ status: "error" });
      expect(selectStatus(state)).toBe("error");
    });
  });

  describe("selectSubscribedSymbols", () => {
    it("should return empty array when no symbols", () => {
      const state = createMockState({ subscribedSymbols: [] });
      expect(selectSubscribedSymbols(state)).toEqual([]);
    });

    it("should return subscribed symbols", () => {
      const state = createMockState({ subscribedSymbols: ["AAPL", "GOOGL"] });
      expect(selectSubscribedSymbols(state)).toEqual(["AAPL", "GOOGL"]);
    });

    it("should handle single symbol", () => {
      const state = createMockState({ subscribedSymbols: ["TSLA"] });
      expect(selectSubscribedSymbols(state)).toEqual(["TSLA"]);
    });

    it("should preserve symbol order", () => {
      const symbols = ["MSFT", "AMZN", "META", "NVDA"];
      const state = createMockState({ subscribedSymbols: symbols });
      expect(selectSubscribedSymbols(state)).toEqual(symbols);
    });
  });

  describe("selectExtraSubscribedSymbols", () => {
    it("should return empty array when no extra symbols", () => {
      const state = createMockState({ extraSubscribedSymbols: [] });
      expect(selectExtraSubscribedSymbols(state)).toEqual([]);
    });

    it("should return extra subscribed symbols", () => {
      const state = createMockState({ extraSubscribedSymbols: ["BTC", "ETH"] });
      expect(selectExtraSubscribedSymbols(state)).toEqual(["BTC", "ETH"]);
    });
  });

  describe("selectMergedSubscribedSymbols", () => {
    it("should return empty array when both are empty", () => {
      const state = createMockState({
        subscribedSymbols: [],
        extraSubscribedSymbols: [],
      });
      expect(selectMergedSubscribedSymbols(state)).toEqual([]);
    });

    it("should merge main and extra symbols", () => {
      const state = createMockState({
        subscribedSymbols: ["AAPL", "GOOGL"],
        extraSubscribedSymbols: ["BTC", "ETH"],
      });
      const result = selectMergedSubscribedSymbols(state);

      expect(result).toContain("AAPL");
      expect(result).toContain("GOOGL");
      expect(result).toContain("BTC");
      expect(result).toContain("ETH");
    });

    it("should deduplicate symbols", () => {
      const state = createMockState({
        subscribedSymbols: ["AAPL", "BTC"],
        extraSubscribedSymbols: ["BTC", "ETH"],
      });
      const result = selectMergedSubscribedSymbols(state);

      expect(result).toHaveLength(3);
      const btcCount = result.filter((s) => s === "BTC").length;
      expect(btcCount).toBe(1);
    });

    it("should return only main symbols when extra is empty", () => {
      const state = createMockState({
        subscribedSymbols: ["AAPL", "GOOGL"],
        extraSubscribedSymbols: [],
      });
      const result = selectMergedSubscribedSymbols(state);

      expect(result).toEqual(["AAPL", "GOOGL"]);
    });

    it("should return only extra symbols when main is empty", () => {
      const state = createMockState({
        subscribedSymbols: [],
        extraSubscribedSymbols: ["BTC", "ETH"],
      });
      const result = selectMergedSubscribedSymbols(state);

      expect(result).toEqual(["BTC", "ETH"]);
    });
  });

  describe("selectQuotesForSymbols", () => {
    it("should return empty object when no quotes", () => {
      const state = createMockState({
        quotes: {},
      });
      const result = selectQuotesForSymbols(state, ["AAPL"]);

      expect(result).toEqual({});
    });

    it("should return quotes for matching symbols", () => {
      const quotes: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
        GOOGL: { price: 140.0, change: 1.0, changeRate: 0.0072, volume: 500000, timestamp: Date.now() },
      };
      const state = createMockState({ quotes });

      const result = selectQuotesForSymbols(state, ["AAPL", "GOOGL"]);

      expect(result.AAPL).toBeDefined();
      expect(result.GOOGL).toBeDefined();
      expect(result.AAPL.price).toBe(175.5);
      expect(result.GOOGL.price).toBe(140.0);
    });

    it("should convert lowercase symbols to uppercase", () => {
      const quotes: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
      };
      const state = createMockState({ quotes });

      const result = selectQuotesForSymbols(state, ["aapl"]);

      expect(result.AAPL).toBeDefined();
      expect(result.aapl).toBeUndefined();
    });

    it("should not include quotes for symbols not in list", () => {
      const quotes: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
        GOOGL: { price: 140.0, change: 1.0, changeRate: 0.0072, volume: 500000, timestamp: Date.now() },
      };
      const state = createMockState({ quotes });

      const result = selectQuotesForSymbols(state, ["AAPL"]);

      expect(result.AAPL).toBeDefined();
      expect(result.GOOGL).toBeUndefined();
    });

    it("should return empty object for non-existent symbols", () => {
      const quotes: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
      };
      const state = createMockState({ quotes });

      const result = selectQuotesForSymbols(state, ["TSLA", "MSFT"]);

      expect(result).toEqual({});
    });

    it("should handle empty symbol list", () => {
      const quotes: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
      };
      const state = createMockState({ quotes });

      const result = selectQuotesForSymbols(state, []);

      expect(result).toEqual({});
    });

    it("should include all properties of quote", () => {
      const timestamp = Date.now();
      const quotes: QuoteSnapshot = {
        AAPL: {
          price: 175.5,
          change: 2.5,
          changeRate: 0.0145,
          volume: 1000000,
          timestamp,
        },
      };
      const state = createMockState({ quotes });

      const result = selectQuotesForSymbols(state, ["AAPL"]);

      expect(result.AAPL).toEqual({
        price: 175.5,
        change: 2.5,
        changeRate: 0.0145,
        volume: 1000000,
        timestamp,
      });
    });
  });

  describe("selectHistoryForSymbols", () => {
    it("should return empty object when no history", () => {
      const state = createMockState({
        history: {},
      });
      const result = selectHistoryForSymbols(state, ["AAPL"]);

      expect(result).toEqual({});
    });

    it("should return history for matching symbols", () => {
      const history: Record<string, number[]> = {
        AAPL: [170, 172, 174, 175, 175.5],
        GOOGL: [140, 141, 142, 142.5],
      };
      const state = createMockState({ history });

      const result = selectHistoryForSymbols(state, ["AAPL", "GOOGL"]);

      expect(result.AAPL).toEqual([170, 172, 174, 175, 175.5]);
      expect(result.GOOGL).toEqual([140, 141, 142, 142.5]);
    });

    it("should convert lowercase symbols to uppercase", () => {
      const history: Record<string, number[]> = {
        AAPL: [170, 172, 174],
      };
      const state = createMockState({ history });

      const result = selectHistoryForSymbols(state, ["aapl"]);

      expect(result.AAPL).toEqual([170, 172, 174]);
      expect(result.aapl).toBeUndefined();
    });

    it("should not include history for symbols not in list", () => {
      const history: Record<string, number[]> = {
        AAPL: [170, 172, 174],
        GOOGL: [140, 141, 142],
      };
      const state = createMockState({ history });

      const result = selectHistoryForSymbols(state, ["AAPL"]);

      expect(result.AAPL).toEqual([170, 172, 174]);
      expect(result.GOOGL).toBeUndefined();
    });

    it("should return empty object for non-existent symbols", () => {
      const history: Record<string, number[]> = {
        AAPL: [170, 172, 174],
      };
      const state = createMockState({ history });

      const result = selectHistoryForSymbols(state, ["TSLA", "MSFT"]);

      expect(result).toEqual({});
    });

    it("should handle empty symbol list", () => {
      const history: Record<string, number[]> = {
        AAPL: [170, 172, 174],
      };
      const state = createMockState({ history });

      const result = selectHistoryForSymbols(state, []);

      expect(result).toEqual({});
    });

    it("should preserve array values exactly", () => {
      const history: Record<string, number[]> = {
        AAPL: [100.5, 101.2, 102.8],
      };
      const state = createMockState({ history });

      const result = selectHistoryForSymbols(state, ["AAPL"]);

      expect(result.AAPL).toHaveLength(3);
      expect(result.AAPL![0]).toBe(100.5);
      expect(result.AAPL![1]).toBe(101.2);
      expect(result.AAPL![2]).toBe(102.8);
    });
  });
});
