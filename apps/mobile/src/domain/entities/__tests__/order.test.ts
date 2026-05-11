import {
  Order,
  OrderCreate,
} from "../../../domain/entities/order";

describe("Order Entity", () => {
  describe("Order interface", () => {
    it("should accept valid order data", () => {
      const order: Order = {
        order_id: "ORD001",
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "buy",
        quantity: 100,
        order_type: "market",
        status: "filled",
        created_at: "2024-01-15T10:00:00Z",
      };

      expect(order.order_id).toBe("ORD001");
      expect(order.account_id).toBe("ACC001");
      expect(order.instrument_id).toBe("INST001");
      expect(order.side).toBe("buy");
      expect(order.quantity).toBe(100);
      expect(order.order_type).toBe("market");
      expect(order.status).toBe("filled");
      expect(order.created_at).toBe("2024-01-15T10:00:00Z");
    });

    it("should support sell side orders", () => {
      const order: Order = {
        order_id: "ORD002",
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "sell",
        quantity: 50,
        order_type: "limit",
        status: "pending",
        created_at: "2024-01-16T11:00:00Z",
      };

      expect(order.side).toBe("sell");
      expect(order.status).toBe("pending");
    });

    it("should accept various order types", () => {
      const orderTypes = ["market", "limit", "stop", "stop_limit", "trailing_stop"];

      orderTypes.forEach((orderType) => {
        const order: Order = {
          order_id: `ORD_${orderType}`,
          account_id: "ACC001",
          instrument_id: "INST001",
          side: "buy",
          quantity: 10,
          order_type: orderType,
          status: "open",
          created_at: "2024-01-17T09:00:00Z",
        };

        expect(order.order_type).toBe(orderType);
      });
    });

    it("should accept various order statuses", () => {
      const statuses = ["pending", "open", "filled", "partial", "cancelled", "rejected"];

      statuses.forEach((status) => {
        const order: Order = {
          order_id: `ORD_STATUS_${status}`,
          account_id: "ACC001",
          instrument_id: "INST001",
          side: "buy",
          quantity: 10,
          order_type: "market",
          status,
          created_at: "2024-01-18T09:00:00Z",
        };

        expect(order.status).toBe(status);
      });
    });

    it("should handle zero quantity for conditional orders", () => {
      const order: Order = {
        order_id: "ORD003",
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "buy",
        quantity: 0,
        order_type: "stop",
        status: "pending",
        created_at: "2024-01-19T09:00:00Z",
      };

      expect(order.quantity).toBe(0);
    });
  });

  describe("OrderCreate interface", () => {
    it("should accept valid order creation data", () => {
      const orderCreate: OrderCreate = {
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "buy",
        quantity: 100,
        order_type: "market",
        status: "pending",
      };

      expect(orderCreate.account_id).toBe("ACC001");
      expect(orderCreate.instrument_id).toBe("INST001");
      expect(orderCreate.side).toBe("buy");
      expect(orderCreate.quantity).toBe(100);
      expect(orderCreate.order_type).toBe("market");
      expect(orderCreate.status).toBe("pending");
    });

    it("should allow optional order_type", () => {
      const orderCreate: OrderCreate = {
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "buy",
        quantity: 50,
      };

      expect(orderCreate.order_type).toBeUndefined();
    });

    it("should allow optional status", () => {
      const orderCreate: OrderCreate = {
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "sell",
        quantity: 75,
        order_type: "limit",
      };

      expect(orderCreate.status).toBeUndefined();
    });

    it("should accept both sides", () => {
      const buyOrder: OrderCreate = {
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "buy",
        quantity: 100,
      };

      const sellOrder: OrderCreate = {
        account_id: "ACC001",
        instrument_id: "INST001",
        side: "sell",
        quantity: 100,
      };

      expect(buyOrder.side).toBe("buy");
      expect(sellOrder.side).toBe("sell");
    });
  });
});
