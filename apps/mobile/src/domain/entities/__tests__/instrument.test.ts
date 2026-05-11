import type { Instrument } from "@/src/domain/entities/instrument";

describe("Instrument Entity", () => {
  describe("Instrument interface", () => {
    it("should accept valid instrument data", () => {
      const instrument: Instrument = {
        instrument_id: "INST001",
        symbol: "AAPL",
        name: "Apple Inc.",
        asset_class: "equity",
        currency: "USD",
        exchange: "NASDAQ",
      };

      expect(instrument.instrument_id).toBe("INST001");
      expect(instrument.symbol).toBe("AAPL");
      expect(instrument.name).toBe("Apple Inc.");
      expect(instrument.asset_class).toBe("equity");
      expect(instrument.currency).toBe("USD");
      expect(instrument.exchange).toBe("NASDAQ");
    });

    it("should allow null name", () => {
      const instrument: Instrument = {
        instrument_id: "INST002",
        symbol: "SPY",
        name: null,
        asset_class: "equity",
        currency: "USD",
        exchange: "NYSE",
      };

      expect(instrument.name).toBeNull();
    });

    it("should allow null asset_class", () => {
      const instrument: Instrument = {
        instrument_id: "INST003",
        symbol: "BND",
        name: "Vanguard Total Bond Market ETF",
        asset_class: null,
        currency: "USD",
        exchange: "NYSE",
      };

      expect(instrument.asset_class).toBeNull();
    });

    it("should allow null currency", () => {
      const instrument: Instrument = {
        instrument_id: "INST004",
        symbol: "FX",
        name: "Foreign Exchange",
        asset_class: "currency",
        currency: null,
        exchange: "FX",
      };

      expect(instrument.currency).toBeNull();
    });

    it("should allow null exchange", () => {
      const instrument: Instrument = {
        instrument_id: "INST005",
        symbol: "CRYPTO",
        name: "Bitcoin",
        asset_class: "crypto",
        currency: "BTC",
        exchange: null,
      };

      expect(instrument.exchange).toBeNull();
    });

    it("should accept various asset classes", () => {
      const assetClasses = ["equity", "fixed_income", "cash", "crypto", "commodity", "real_estate"];
      
      assetClasses.forEach((asset_class) => {
        const instrument: Instrument = {
          instrument_id: `INST-${asset_class}`,
          symbol: asset_class.toUpperCase().slice(0, 4),
          name: asset_class,
          asset_class,
          currency: "USD",
          exchange: "EXCHANGE",
        };
        expect(instrument.asset_class).toBe(asset_class);
      });
    });

    it("should accept various currencies", () => {
      const currencies = ["USD", "EUR", "GBP", "JPY", "CNY", "BTC", "ETH"];
      
      currencies.forEach((currency) => {
        const instrument: Instrument = {
          instrument_id: `INST-${currency}`,
          symbol: currency,
          name: currency,
          asset_class: "currency",
          currency,
          exchange: "FX",
        };
        expect(instrument.currency).toBe(currency);
      });
    });

    it("should handle all null optional fields", () => {
      const instrument: Instrument = {
        instrument_id: "INST_NULL",
        symbol: "UNKNOWN",
        name: null,
        asset_class: null,
        currency: null,
        exchange: null,
      };

      expect(instrument.name).toBeNull();
      expect(instrument.asset_class).toBeNull();
      expect(instrument.currency).toBeNull();
      expect(instrument.exchange).toBeNull();
    });
  });
});
