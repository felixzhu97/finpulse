import {
  QuoteData,
  QuoteSnapshot,
  QuoteConnectionStatus,
} from "../../../domain/entities/quotes";

describe("Quote Entity", () => {
  describe("QuoteData interface", () => {
    it("should accept valid quote data", () => {
      const quote: QuoteData = {
        price: 175.5,
        change: 2.5,
        changeRate: 0.0145,
        volume: 1000000,
        timestamp: Date.now(),
      };

      expect(quote.price).toBe(175.5);
      expect(quote.change).toBe(2.5);
      expect(quote.changeRate).toBe(0.0145);
      expect(quote.volume).toBe(1000000);
      expect(quote.timestamp).toBeDefined();
    });

    it("should allow optional volume", () => {
      const quote: QuoteData = {
        price: 175.5,
        change: 2.5,
        changeRate: 0.0145,
        timestamp: Date.now(),
      };

      expect(quote.volume).toBeUndefined();
    });

    it("should accept zero change", () => {
      const quote: QuoteData = {
        price: 175.5,
        change: 0,
        changeRate: 0,
        timestamp: Date.now(),
      };

      expect(quote.change).toBe(0);
      expect(quote.changeRate).toBe(0);
    });

    it("should accept negative change", () => {
      const quote: QuoteData = {
        price: 170.0,
        change: -5.5,
        changeRate: -0.0314,
        timestamp: Date.now(),
      };

      expect(quote.change).toBeLessThan(0);
      expect(quote.changeRate).toBeLessThan(0);
    });
  });

  describe("QuoteSnapshot type", () => {
    it("should accept valid quote snapshot", () => {
      const snapshot: QuoteSnapshot = {
        AAPL: { price: 175.5, change: 2.5, changeRate: 0.0145, volume: 1000000, timestamp: Date.now() },
        GOOGL: { price: 140.25, change: -1.5, changeRate: -0.0106, timestamp: Date.now() },
      };

      expect(snapshot.AAPL.price).toBe(175.5);
      expect(snapshot.GOOGL.price).toBe(140.25);
    });

    it("should support multiple symbols", () => {
      const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];
      const snapshot: QuoteSnapshot = {};

      symbols.forEach((symbol, index) => {
        snapshot[symbol] = {
          price: 100 + index * 10,
          change: index % 2 === 0 ? 1 : -1,
          changeRate: index % 2 === 0 ? 0.01 : -0.01,
          timestamp: Date.now(),
        };
      });

      expect(Object.keys(snapshot)).toHaveLength(5);
      expect(snapshot.TSLA.price).toBe(140);
    });

    it("should be empty by default", () => {
      const snapshot: QuoteSnapshot = {};

      expect(Object.keys(snapshot)).toHaveLength(0);
    });
  });

  describe("QuoteConnectionStatus type", () => {
    it("should accept idle status", () => {
      const status: QuoteConnectionStatus = "idle";

      expect(status).toBe("idle");
    });

    it("should accept connecting status", () => {
      const status: QuoteConnectionStatus = "connecting";

      expect(status).toBe("connecting");
    });

    it("should accept open status", () => {
      const status: QuoteConnectionStatus = "open";

      expect(status).toBe("open");
    });

    it("should accept closed status", () => {
      const status: QuoteConnectionStatus = "closed";

      expect(status).toBe("closed");
    });

    it("should accept error status", () => {
      const status: QuoteConnectionStatus = "error";

      expect(status).toBe("error");
    });

    it("should represent connection lifecycle", () => {
      const lifecycle: QuoteConnectionStatus[] = ["idle", "connecting", "open", "closed"];

      expect(lifecycle).toContain("idle");
      expect(lifecycle).toContain("connecting");
      expect(lifecycle).toContain("open");
      expect(lifecycle).toContain("closed");
    });
  });
});
