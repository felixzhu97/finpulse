import * as quotesSliceModule from "../../../presentation/store/quotesSlice";
import type { QuoteSnapshot } from "@/src/domain/entities/quotes";

const {
  quotesSlice,
  setSubscribedSymbols,
  setSnapshot,
  setStatus,
  setHistory,
  setExtraSubscribedSymbols,
} = quotesSliceModule;

describe("quotesSlice", () => {
  const initialState = quotesSlice.getInitialState();

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
    it("should set subscribed symbols", () => {
      const action = setSubscribedSymbols(["AAPL", "GOOGL"]);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.subscribedSymbols).toContain("AAPL");
      expect(state.subscribedSymbols).toContain("GOOGL");
    });

    it("should convert symbols to uppercase", () => {
      const action = setSubscribedSymbols(["aapl", "googl"]);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.subscribedSymbols).toContain("AAPL");
      expect(state.subscribedSymbols).toContain("GOOGL");
    });

    it("should deduplicate symbols", () => {
      const action = setSubscribedSymbols(["AAPL", "aapl", "AAPL"]);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.subscribedSymbols).toHaveLength(1);
      expect(state.subscribedSymbols[0]).toBe("AAPL");
    });

    it("should handle mixed case symbols", () => {
      const action = setSubscribedSymbols(["AaPl", "gOoGl", "TsLa"]);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.subscribedSymbols).toEqual(["AAPL", "GOOGL", "TSLA"]);
    });
  });

  describe("setSnapshot action", () => {
    it("should set quotes snapshot", () => {
      const snapshot: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
      };

      const action = setSnapshot(snapshot);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.quotes.AAPL.price).toBe(175.5);
      expect(state.quotes.AAPL.change).toBe(2.5);
    });

    it("should convert symbol keys to uppercase", () => {
      const snapshot: QuoteSnapshot = {
        aapl: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
      };

      const action = setSnapshot(snapshot);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.quotes.AAPL).toBeDefined();
      expect(state.quotes.aapl).toBeUndefined();
    });

    it("should initialize history for new symbols", () => {
      const snapshot: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
      };

      const action = setSnapshot(snapshot);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.history.AAPL).toBeDefined();
      expect(state.history.AAPL).toContain(175.5);
    });

    it("should append to existing history", () => {
      const stateWithHistory = {
        ...initialState,
        history: { AAPL: [170, 172, 174] },
      };

      const snapshot: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
      };

      const action = setSnapshot(snapshot);
      const state = quotesSlice.reducer(stateWithHistory, action);

      expect(state.history.AAPL).toContain(175.5);
      expect(state.history.AAPL).toHaveLength(4);
    });

    it("should not duplicate consecutive same prices", () => {
      const stateWithHistory = {
        ...initialState,
        history: { AAPL: [175.5] },
      };

      const snapshot: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 0, changeRate: 0, volume: 1000000, timestamp: Date.now() },
      };

      const action = setSnapshot(snapshot);
      const state = quotesSlice.reducer(stateWithHistory, action);

      expect(state.history.AAPL).toHaveLength(1);
    });
  });

  describe("setStatus action", () => {
    it("should set status to connecting", () => {
      const action = setStatus("connecting");
      const state = quotesSlice.reducer(initialState, action);

      expect(state.status).toBe("connecting");
    });

    it("should set status to open", () => {
      const action = setStatus("open");
      const state = quotesSlice.reducer(initialState, action);

      expect(state.status).toBe("open");
    });

    it("should set status to closed", () => {
      const action = setStatus("closed");
      const state = quotesSlice.reducer(initialState, action);

      expect(state.status).toBe("closed");
    });

    it("should set status to error", () => {
      const action = setStatus("error");
      const state = quotesSlice.reducer(initialState, action);

      expect(state.status).toBe("error");
    });

    it("should transition through status lifecycle", () => {
      let state = quotesSlice.reducer(initialState, setStatus("connecting"));
      expect(state.status).toBe("connecting");

      state = quotesSlice.reducer(state, setStatus("open"));
      expect(state.status).toBe("open");

      state = quotesSlice.reducer(state, setStatus("closed"));
      expect(state.status).toBe("closed");
    });
  });

  describe("setHistory action", () => {
    it("should set history and mark as loaded", () => {
      const history = {
        AAPL: [170, 172, 174, 175, 175.5],
        GOOGL: [140, 141, 142, 142.5],
      };

      const action = setHistory(history);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.historyLoaded).toBe(true);
      expect(state.history.AAPL).toEqual([170, 172, 174, 175, 175.5]);
    });

    it("should convert symbol keys to uppercase", () => {
      const history = {
        aapl: [170, 172, 174],
        googl: [140, 141, 142],
      };

      const action = setHistory(history);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.history.AAPL).toBeDefined();
      expect(state.history.GOOGL).toBeDefined();
    });

    it("should limit history to max 45 points", () => {
      const longHistory = Array.from({ length: 100 }, (_, i) => 100 + i);
      const history = { AAPL: longHistory };

      const action = setHistory(history);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.history.AAPL).toHaveLength(45);
      expect(state.history.AAPL[0]).toBe(155);
    });

    it("should keep last 45 points from long history", () => {
      const longHistory = Array.from({ length: 50 }, (_, i) => 100 + i);
      const history = { AAPL: longHistory };

      const action = setHistory(history);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.history.AAPL).toHaveLength(45);
      expect(state.history.AAPL[0]).toBe(105);
    });

    it("should ignore empty arrays", () => {
      const history = {
        AAPL: [170, 172, 174],
        GOOGL: [],
      };

      const action = setHistory(history);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.history.AAPL).toHaveLength(3);
      expect(state.history.GOOGL).toBeUndefined();
    });

    it("should ignore undefined arrays", () => {
      const history = {
        AAPL: [170, 172, 174],
        GOOGL: undefined,
      };

      const action = setHistory(history);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.history.AAPL).toHaveLength(3);
      expect(state.history.GOOGL).toBeUndefined();
    });
  });

  describe("setExtraSubscribedSymbols action", () => {
    it("should set extra subscribed symbols", () => {
      const action = setExtraSubscribedSymbols(["BTC", "ETH"]);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.extraSubscribedSymbols).toContain("BTC");
      expect(state.extraSubscribedSymbols).toContain("ETH");
    });

    it("should convert symbols to uppercase", () => {
      const action = setExtraSubscribedSymbols(["btc", "eth"]);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.extraSubscribedSymbols).toContain("BTC");
      expect(state.extraSubscribedSymbols).toContain("ETH");
    });

    it("should filter out empty strings", () => {
      const action = setExtraSubscribedSymbols(["BTC", "", "ETH", ""]);
      const state = quotesSlice.reducer(initialState, action);

      expect(state.extraSubscribedSymbols).toHaveLength(2);
      expect(state.extraSubscribedSymbols).not.toContain("");
    });
  });
});
