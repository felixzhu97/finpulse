import { Instrument } from "../../../domain/entities/instrument";

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
        symbol: "UNKNOWN",
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
        symbol: "XYZ",
        name: "XYZ Corp",
        asset_class: null,
        currency: "USD",
        exchange: "NASDAQ",
      };

      expect(instrument.asset_class).toBeNull();
    });

    it("should allow null currency", () => {
      const instrument: Instrument = {
        instrument_id: "INST004",
        symbol: "DEF",
        name: "DEF Industries",
        asset_class: "bond",
        currency: null,
        exchange: "NYSE",
      };

      expect(instrument.currency).toBeNull();
    });

    it("should allow null exchange", () => {
      const instrument: Instrument = {
        instrument_id: "INST005",
        symbol: "GHI",
        name: "GHI Holdings",
        asset_class: "fund",
        currency: "EUR",
        exchange: null,
      };

      expect(instrument.exchange).toBeNull();
    });

    it("should accept various asset classes", () => {
      const assetClasses = ["equity", "bond", "fund", "etf", "option", "futures", "commodity", "forex", "crypto"];

      assetClasses.forEach((assetClass) => {
        const instrument: Instrument = {
          instrument_id: `INST_${assetClass}`,
          symbol: assetClass.toUpperCase(),
          name: `${assetClass} Asset`,
          asset_class: assetClass,
          currency: "USD",
          exchange: "EXCHANGE",
        };

        expect(instrument.asset_class).toBe(assetClass);
      });
    });

    it("should accept various currencies", () => {
      const currencies = ["USD", "EUR", "GBP", "JPY", "HKD", "CNY", "CHF", "AUD"];

      currencies.forEach((currency) => {
        const instrument: Instrument = {
          instrument_id: `INST_${currency}`,
          symbol: currency,
          name: `${currency} Asset`,
          asset_class: "equity",
          currency,
          exchange: "EXCHANGE",
        };

        expect(instrument.currency).toBe(currency);
      });
    });

    it("should handle cryptocurrency instruments", () => {
      const crypto: Instrument = {
        instrument_id: "CRYPTO_BTC",
        symbol: "BTC",
        name: "Bitcoin",
        asset_class: "crypto",
        currency: "USD",
        exchange: "CRYPTO",
      };

      expect(crypto.symbol).toBe("BTC");
      expect(crypto.asset_class).toBe("crypto");
      expect(crypto.exchange).toBe("CRYPTO");
    });
  });
});
