import { Trade, TradeCreate } from "../../../domain/entities/trade";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const TRADE_DOMAIN = {
  IDS: {
    PREFIX: "T",
    ORDER_PREFIX: "O",
    TEST: "T001",
    ORDER: "O001",
  } as const,
  TIMESTAMPS: {
    NOW: "2024-01-15T10:30:00Z",
    LATER: "2024-01-16T14:00:00Z",
  } as const,
  AMOUNTS: {
    TYPICAL_PRICE: 150.5,
    TYPICAL_QUANTITY: 100,
    TYPICAL_FEE: 0.5,
    SMALL_FEE: 0.01,
  } as const,
  SURVEILLANCE: {
    ALERTS: ["HIGH_VOLUME", "WASH_TRADING", "FRONT_RUNNING", null] as const,
    SCORE: {
      LOW: 0.2,
      MEDIUM: 0.5,
      HIGH: 0.85,
    } as const,
  } as const,
} as const;

const SCENARIOS = {
  TRADE_TYPES: [
    {
      price: 150.5,
      quantity: 100,
      fee: 0.5,
      desc: "standard equity trade",
    },
    {
      price: 0.01,
      quantity: 10000,
      fee: 1.0,
      desc: "high-volume trade",
    },
    {
      price: -100.0,
      quantity: 50,
      fee: null,
      desc: "short selling trade",
    },
  ] as const,
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createTrade = (overrides: Partial<Trade> = {}): Trade => ({
  trade_id: TRADE_DOMAIN.IDS.TEST,
  order_id: TRADE_DOMAIN.IDS.ORDER,
  quantity: TRADE_DOMAIN.AMOUNTS.TYPICAL_QUANTITY,
  price: TRADE_DOMAIN.AMOUNTS.TYPICAL_PRICE,
  fee: TRADE_DOMAIN.AMOUNTS.TYPICAL_FEE,
  executed_at: TRADE_DOMAIN.TIMESTAMPS.NOW,
  ...overrides,
});

const createTradeCreate = (overrides: Partial<TradeCreate> = {}): TradeCreate => ({
  order_id: TRADE_DOMAIN.IDS.ORDER,
  quantity: TRADE_DOMAIN.AMOUNTS.TYPICAL_QUANTITY,
  price: TRADE_DOMAIN.AMOUNTS.TYPICAL_PRICE,
  fee: TRADE_DOMAIN.AMOUNTS.TYPICAL_FEE,
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("Trade Entity", () => {
  describe("Trade interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete trade data", () => {
        // Arrange
        const trade = createTrade();

        // Assert
        expect(trade.trade_id).toBe(TRADE_DOMAIN.IDS.TEST);
        expect(trade.order_id).toBe(TRADE_DOMAIN.IDS.ORDER);
        expect(trade.quantity).toBe(TRADE_DOMAIN.AMOUNTS.TYPICAL_QUANTITY);
        expect(trade.price).toBe(TRADE_DOMAIN.AMOUNTS.TYPICAL_PRICE);
        expect(trade.fee).toBe(TRADE_DOMAIN.AMOUNTS.TYPICAL_FEE);
        expect(trade.executed_at).toBe(TRADE_DOMAIN.TIMESTAMPS.NOW);
      });
    });

    describe("when handling optional surveillance fields", () => {
      it.each([
        { alert: "HIGH_VOLUME", score: 0.5, desc: "with alert and score" },
        { alert: null, score: null, desc: "with null values" },
        { alert: undefined, score: undefined, desc: "with undefined values" },
      ])("should accept $desc", ({ alert, score }) => {
        const trade = createTrade({
          surveillance_alert: alert,
          surveillance_score: score,
        });
        expect(trade.surveillance_alert).toBe(alert);
        expect(trade.surveillance_score).toBe(score);
      });

      it("should allow undefined when not provided", () => {
        const trade = createTrade();
        expect(trade.surveillance_alert).toBeUndefined();
        expect(trade.surveillance_score).toBeUndefined();
      });
    });

    describe("when handling fee field", () => {
      it.each([
        { fee: 0.5, desc: "standard fee" },
        { fee: 0.01, desc: "small fee" },
        { fee: null, desc: "null fee" },
        { fee: undefined, desc: "undefined fee" },
      ])("should accept $desc", ({ fee }) => {
        const trade = createTrade({ fee });
        expect(trade.fee).toBe(fee);
      });
    });

    describe("when modeling real-world trades", () => {
      it.each(SCENARIOS.TRADE_TYPES)(
        "should model $desc",
        ({ price, quantity, fee, desc }) => {
          const trade = createTrade({ price, quantity, fee });
          expect(trade.price).toBe(price);
          expect(trade.quantity).toBe(quantity);
          expect(trade.fee).toBe(fee);
        }
      );
    });

    describe("when validating timestamps", () => {
      it("should accept ISO timestamp format", () => {
        const trade = createTrade({
          executed_at: TRADE_DOMAIN.TIMESTAMPS.LATER,
        });
        expect(new Date(trade.executed_at)).toBeInstanceOf(Date);
      });
    });
  });

  describe("TradeCreate interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete trade creation data", () => {
        // Arrange
        const tradeCreate = createTradeCreate();

        // Assert
        expect(tradeCreate.order_id).toBe(TRADE_DOMAIN.IDS.ORDER);
        expect(tradeCreate.quantity).toBe(TRADE_DOMAIN.AMOUNTS.TYPICAL_QUANTITY);
        expect(tradeCreate.price).toBe(TRADE_DOMAIN.AMOUNTS.TYPICAL_PRICE);
        expect(tradeCreate.fee).toBe(TRADE_DOMAIN.AMOUNTS.TYPICAL_FEE);
      });
    });

    describe("when handling optional fee field", () => {
      it.each([
        { fee: 0.5, desc: "with fee" },
        { fee: null, desc: "with null fee" },
        { fee: undefined, desc: "without fee" },
      ])("should accept $desc", ({ fee }) => {
        const tradeCreate = createTradeCreate({ fee });
        expect(tradeCreate.fee).toBe(fee);
      });
    });

    describe("when validating quantity values", () => {
      it.each([
        { qty: 0, desc: "zero quantity" },
        { qty: 1, desc: "single unit" },
        { qty: 100, desc: "typical quantity" },
        { qty: 1000000, desc: "large quantity" },
      ])("should accept $desc", ({ qty }) => {
        const tradeCreate = createTradeCreate({ quantity: qty });
        expect(tradeCreate.quantity).toBe(qty);
      });
    });

    describe("when validating price values", () => {
      it.each([
        { price: 100.0, desc: "positive price" },
        { price: 0.01, desc: "small price" },
        { price: -100.0, desc: "negative price for short selling" },
      ])("should accept $desc", ({ price }) => {
        const tradeCreate = createTradeCreate({ price });
        expect(tradeCreate.price).toBe(price);
      });
    });
  });
});
