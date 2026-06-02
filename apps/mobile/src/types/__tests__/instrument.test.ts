import type { Instrument } from "@/src/types/instrument";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const INSTRUMENT_DOMAIN = {
  ASSET_CLASSES: ["equity", "fixed_income", "cash", "crypto", "commodity", "real_estate"] as const,
  CURRENCIES: ["USD", "EUR", "GBP", "JPY", "CNY", "BTC", "ETH"] as const,
  EXCHANGES: ["NASDAQ", "NYSE", "LSE", "TSE", "HKEX", "FX"] as const,
  IDS: {
    PREFIX: "INST",
    EQUITY: "INST_EQUITY",
    BOND: "INST_BOND",
    CRYPTO: "INST_CRYPTO",
    TEST: "INST_TEST",
  } as const,
} as const;

const NULLABLE_FIELDS = {
  name: ["Apple Inc.", "Vanguard Total Bond Market ETF", null],
  asset_class: ["equity", "crypto", null],
  currency: ["USD", "BTC", null],
  exchange: ["NASDAQ", null],
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createInstrument = (overrides: Partial<Instrument> = {}): Instrument => ({
  instrument_id: `${INSTRUMENT_DOMAIN.IDS.PREFIX}_001`,
  symbol: "AAPL",
  name: "Apple Inc.",
  asset_class: "equity",
  currency: "USD",
  exchange: "NASDAQ",
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("Instrument Entity", () => {
  describe("Instrument interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete instrument data", () => {
        // Arrange
        const instrument = createInstrument();

        // Assert
        expect(instrument.instrument_id).toBeDefined();
        expect(instrument.symbol).toBeDefined();
        expect(instrument.name).toBe("Apple Inc.");
        expect(instrument.asset_class).toBe("equity");
        expect(instrument.currency).toBe("USD");
        expect(instrument.exchange).toBe("NASDAQ");
      });
    });

    describe("when handling nullable fields", () => {
      it.each([
        { field: "name", value: null, desc: "null name" },
        { field: "name", value: "SPY", desc: "symbol as name" },
        { field: "asset_class", value: null, desc: "null asset_class" },
        { field: "currency", value: null, desc: "null currency" },
        { field: "exchange", value: null, desc: "null exchange" },
      ])("should accept $desc", ({ field, value }) => {
        const instrument = createInstrument({ [field]: value } as Partial<Instrument>);
        expect(instrument[field]).toBe(value);
      });

      it("should accept all fields as null", () => {
        const instrument = createInstrument({
          instrument_id: "INST_NULL",
          symbol: "UNKNOWN",
          name: null,
          asset_class: null,
          currency: null,
          exchange: null,
        });

        expect(instrument.name).toBeNull();
        expect(instrument.asset_class).toBeNull();
        expect(instrument.currency).toBeNull();
        expect(instrument.exchange).toBeNull();
      });
    });

    describe("when validating asset classes", () => {
      it.each(INSTRUMENT_DOMAIN.ASSET_CLASSES)(
        "should accept asset class: %s",
        (assetClass) => {
          const instrument = createInstrument({
            instrument_id: `INST_${assetClass}`,
            symbol: assetClass.toUpperCase().slice(0, 4),
            asset_class: assetClass,
          });
          expect(instrument.asset_class).toBe(assetClass);
        }
      );
    });

    describe("when validating currencies", () => {
      it.each(INSTRUMENT_DOMAIN.CURRENCIES)(
        "should accept currency: %s",
        (currency) => {
          const instrument = createInstrument({
            instrument_id: `INST_${currency}`,
            currency,
          });
          expect(instrument.currency).toBe(currency);
        }
      );
    });

    describe("when validating exchanges", () => {
      it.each(INSTRUMENT_DOMAIN.EXCHANGES)(
        "should accept exchange: %s",
        (exchange) => {
          const instrument = createInstrument({ exchange });
          expect(instrument.exchange).toBe(exchange);
        }
      );
    });

    describe("when modeling real-world instruments", () => {
      it.each([
        {
          id: "INST_STOCK",
          symbol: "AAPL",
          name: "Apple Inc.",
          assetClass: "equity",
          currency: "USD",
          exchange: "NASDAQ",
          desc: "NASDAQ stock",
        },
        {
          id: "INST_ETF",
          symbol: "BND",
          name: "Vanguard Total Bond Market ETF",
          assetClass: "fixed_income",
          currency: "USD",
          exchange: "NYSE",
          desc: "bond ETF",
        },
        {
          id: "INST_CBDC",
          symbol: "BTC",
          name: "Bitcoin",
          assetClass: "crypto",
          currency: "BTC",
          exchange: null,
          desc: "cryptocurrency",
        },
        {
          id: "INST_FX",
          symbol: "EURUSD",
          name: "Euro/US Dollar",
          assetClass: "cash",
          currency: null,
          exchange: "FX",
          desc: "forex pair",
        },
      ])("should model $desc", ({ id, symbol, name, assetClass, currency, exchange }) => {
        const instrument = createInstrument({
          instrument_id: id,
          symbol,
          name,
          asset_class: assetClass,
          currency,
          exchange,
        });

        expect(instrument.instrument_id).toBe(id);
        expect(instrument.symbol).toBe(symbol);
        expect(instrument.asset_class).toBe(assetClass);
        expect(instrument.exchange).toBe(exchange);
      });
    });
  });
});
