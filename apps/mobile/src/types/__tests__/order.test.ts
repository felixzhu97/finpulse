import { Order, OrderCreate } from "@/src/types/order";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const ORDER_DOMAIN = {
  SIDES: ["buy", "sell"] as const,
  TYPES: ["market", "limit", "stop", "stop_limit", "trailing_stop"] as const,
  STATUSES: ["pending", "open", "filled", "partial", "cancelled", "rejected"] as const,
  IDS: {
    PREFIX: "ORD",
    ORDER: "ORD001",
    ACCOUNT: "ACC001",
    INSTRUMENT: "INST001",
  } as const,
  TIMESTAMPS: {
    NOW: "2024-01-15T10:00:00Z",
    LATER: "2024-01-16T11:00:00Z",
    FUTURE: "2024-12-31T23:59:59Z",
  } as const,
  QUANTITIES: {
    ZERO: 0,
    SMALL: 10,
    TYPICAL: 100,
    LARGE: 10000,
  } as const,
} as const;

const BOUNDARY_VALUES = {
  QUANTITY: [0, 1, 9999, 10000],
  NEGATIVE_QUANTITY: [-1, -100],
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createOrder = (overrides: Partial<Order> = {}): Order => ({
  order_id: ORDER_DOMAIN.IDS.ORDER,
  account_id: ORDER_DOMAIN.IDS.ACCOUNT,
  instrument_id: ORDER_DOMAIN.IDS.INSTRUMENT,
  side: "buy",
  quantity: ORDER_DOMAIN.QUANTITIES.TYPICAL,
  order_type: "market",
  status: "filled",
  created_at: ORDER_DOMAIN.TIMESTAMPS.NOW,
  ...overrides,
});

const createOrderCreate = (overrides: Partial<OrderCreate> = {}): OrderCreate => ({
  account_id: ORDER_DOMAIN.IDS.ACCOUNT,
  instrument_id: ORDER_DOMAIN.IDS.INSTRUMENT,
  side: "buy",
  quantity: ORDER_DOMAIN.QUANTITIES.TYPICAL,
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("Order Entity", () => {
  describe("Order interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete order data", () => {
        // Arrange
        const order = createOrder();

        // Assert
        expect(order.order_id).toBe(ORDER_DOMAIN.IDS.ORDER);
        expect(order.account_id).toBe(ORDER_DOMAIN.IDS.ACCOUNT);
        expect(order.instrument_id).toBe(ORDER_DOMAIN.IDS.INSTRUMENT);
        expect(order.side).toBe("buy");
        expect(order.quantity).toBe(ORDER_DOMAIN.QUANTITIES.TYPICAL);
        expect(order.order_type).toBe("market");
        expect(order.status).toBe("filled");
      });
    });

    describe("when validating order sides", () => {
      it.each(ORDER_DOMAIN.SIDES)("should accept side: %s", (side) => {
        const order = createOrder({ side });
        expect(order.side).toBe(side);
      });
    });

    describe("when validating order types", () => {
      it.each(ORDER_DOMAIN.TYPES)("should accept order type: %s", (orderType) => {
        const order = createOrder({ order_type: orderType });
        expect(order.order_type).toBe(orderType);
      });
    });

    describe("when validating order statuses", () => {
      it.each(ORDER_DOMAIN.STATUSES)("should accept status: %s", (status) => {
        const order = createOrder({ status });
        expect(order.status).toBe(status);
      });
    });

    describe("when handling quantities", () => {
      it.each([
        { qty: 0, desc: "zero quantity" },
        { qty: 1, desc: "minimum quantity" },
        { qty: 100, desc: "typical quantity" },
        { qty: 10000, desc: "maximum quantity" },
      ])("should accept $desc", ({ qty }) => {
        const order = createOrder({ quantity: qty });
        expect(order.quantity).toBe(qty);
      });

      it.each(BOUNDARY_VALUES.NEGATIVE_QUANTITY)(
        "should accept negative quantity %d",
        (qty) => {
          const order = createOrder({ quantity: qty });
          expect(order.quantity).toBe(qty);
        }
      );
    });

    describe("when modeling real-world orders", () => {
      it.each([
        {
          id: "ORD_BUY_MARKET",
          side: "buy",
          orderType: "market",
          status: "filled",
          desc: "filled market buy order",
        },
        {
          id: "ORD_SELL_LIMIT",
          side: "sell",
          orderType: "limit",
          status: "pending",
          desc: "pending limit sell order",
        },
        {
          id: "ORD_STOP_LOSS",
          side: "sell",
          orderType: "stop",
          status: "open",
          desc: "open stop-loss order",
        },
        {
          id: "ORD_TRAILING",
          side: "buy",
          orderType: "trailing_stop",
          status: "pending",
          desc: "trailing stop order",
        },
      ])("should model $desc", ({ id, side, orderType, status }) => {
        const order = createOrder({
          order_id: id,
          side,
          order_type: orderType,
          status,
        });

        expect(order.side).toBe(side);
        expect(order.order_type).toBe(orderType);
        expect(order.status).toBe(status);
      });
    });
  });

  describe("OrderCreate interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete order creation data", () => {
        // Arrange
        const orderCreate = createOrderCreate();

        // Assert
        expect(orderCreate.account_id).toBe(ORDER_DOMAIN.IDS.ACCOUNT);
        expect(orderCreate.instrument_id).toBe(ORDER_DOMAIN.IDS.INSTRUMENT);
        expect(orderCreate.side).toBe("buy");
        expect(orderCreate.quantity).toBe(ORDER_DOMAIN.QUANTITIES.TYPICAL);
      });
    });

    describe("when handling optional fields", () => {
      it.each([
        { field: "order_type", value: "limit", desc: "with order_type" },
        { field: "order_type", value: undefined, desc: "without order_type" },
        { field: "status", value: "pending", desc: "with status" },
        { field: "status", value: undefined, desc: "without status" },
      ])("should accept creation $desc", ({ field, value }) => {
        const orderCreate = createOrderCreate({ [field]: value } as Partial<OrderCreate>);
        if (value === undefined) {
          expect(orderCreate[field]).toBeUndefined();
        } else {
          expect(orderCreate[field]).toBe(value);
        }
      });
    });

    describe("when validating both sides", () => {
      it.each(ORDER_DOMAIN.SIDES)("should accept side: %s", (side) => {
        const orderCreate = createOrderCreate({ side });
        expect(orderCreate.side).toBe(side);
      });
    });
  });
});
