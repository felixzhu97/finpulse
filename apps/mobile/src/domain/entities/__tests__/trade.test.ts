import {
  Trade,
  TradeCreate,
} from "../../../domain/entities/trade";

describe("Trade Entity", () => {
  describe("Trade interface", () => {
    it("should accept valid trade data", () => {
      const trade: Trade = {
        trade_id: "T001",
        order_id: "O001",
        quantity: 100,
        price: 150.5,
        fee: 0.5,
        executed_at: "2024-01-15T10:30:00Z",
        surveillance_alert: null,
        surveillance_score: 0.2,
      };

      expect(trade.trade_id).toBe("T001");
      expect(trade.order_id).toBe("O001");
      expect(trade.quantity).toBe(100);
      expect(trade.price).toBe(150.5);
      expect(trade.fee).toBe(0.5);
      expect(trade.executed_at).toBe("2024-01-15T10:30:00Z");
      expect(trade.surveillance_score).toBe(0.2);
    });

    it("should allow optional surveillance fields", () => {
      const trade: Trade = {
        trade_id: "T002",
        order_id: "O001",
        quantity: 50,
        price: 200.0,
        fee: null,
        executed_at: "2024-01-16T14:00:00Z",
      };

      expect(trade.surveillance_alert).toBeUndefined();
      expect(trade.surveillance_score).toBeUndefined();
    });

    it("should allow surveillance_alert to be string", () => {
      const trade: Trade = {
        trade_id: "T003",
        order_id: "O001",
        quantity: 75,
        price: 180.25,
        fee: 0.25,
        executed_at: "2024-01-17T09:15:00Z",
        surveillance_alert: "HIGH_VOLUME",
      };

      expect(trade.surveillance_alert).toBe("HIGH_VOLUME");
    });

    it("should handle null fee", () => {
      const trade: Trade = {
        trade_id: "T004",
        order_id: "O002",
        quantity: 200,
        price: 100.0,
        fee: null,
        executed_at: "2024-01-18T11:00:00Z",
      };

      expect(trade.fee).toBeNull();
    });
  });

  describe("TradeCreate interface", () => {
    it("should accept valid trade creation data", () => {
      const tradeCreate: TradeCreate = {
        order_id: "O001",
        quantity: 100,
        price: 150.5,
        fee: 0.5,
      };

      expect(tradeCreate.order_id).toBe("O001");
      expect(tradeCreate.quantity).toBe(100);
      expect(tradeCreate.price).toBe(150.5);
      expect(tradeCreate.fee).toBe(0.5);
    });

    it("should allow optional fee", () => {
      const tradeCreate: TradeCreate = {
        order_id: "O002",
        quantity: 50,
        price: 200.0,
      };

      expect(tradeCreate.fee).toBeUndefined();
    });

    it("should accept null fee", () => {
      const tradeCreate: TradeCreate = {
        order_id: "O003",
        quantity: 75,
        price: 180.25,
        fee: null,
      };

      expect(tradeCreate.fee).toBeNull();
    });

    it("should accept various quantity values", () => {
      const tradeCreate: TradeCreate = {
        order_id: "O004",
        quantity: 0,
        price: 100.0,
      };

      expect(tradeCreate.quantity).toBe(0);
    });

    it("should accept negative price for short selling", () => {
      const tradeCreate: TradeCreate = {
        order_id: "O005",
        quantity: 50,
        price: -100.0,
      };

      expect(tradeCreate.price).toBeLessThan(0);
    });
  });
});
