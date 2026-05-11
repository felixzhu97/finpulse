import {
  Trend,
  StockChangeInfo,
  getStockChangeInfo,
} from "../../../presentation/utils/stockDisplay";

// ============================================================
// Domain Test Values - Stock Display Domain
// ============================================================

const TREND_DOMAIN = {
  VALUES: ["up", "down", "flat"] as Trend[],
  UP: "up" as Trend,
  DOWN: "down" as Trend,
  FLAT: "flat" as Trend,
} as const;

const COLOR_DOMAIN = {
  UP: "#34C759",
  DOWN: "#FF3B30",
  FLAT: "rgba(255,255,255,0.5)",
} as const;

const BOUNDARY_VALUES = {
  // Positive changes
  CHANGE: {
    ZERO: 0,
    SMALL_POSITIVE: 0.001,
    TINY_POSITIVE: 0.0001,
    SMALL: 0.5,
    MEDIUM: 5,
    LARGE: 50,
    EXTRA_LARGE: 150,
    HUGE: 1000,
  },
  // Negative changes
  CHANGE_NEGATIVE: {
    SMALL_NEGATIVE: -0.001,
    TINY_NEGATIVE: -0.0001,
    SMALL: -0.5,
    MEDIUM: -5,
    LARGE: -50,
    EXTRA_LARGE: -75,
    HUGE: -100,
  },
  // Base prices
  BASE_PRICE: {
    ZERO: 0,
    SMALL: 1,
    MEDIUM: 100,
    LARGE: 1000,
    EXTRA_LARGE: 10000,
  },
} as const;

const PERCENTAGE_CALCULATIONS = {
  // [change, basePrice, expectedPercent]
  VALID: [
    [5, 200, 2.5],
    [10, 100, 10.0],
    [1, 3, 33.33],
    [2, 3, 66.67],
    [-5, 200, -2.5],
    [-75, 100, -75.0],
    [150, 100, 150.0],
  ],
} as const;

const EDGE_NUMBERS = {
  ZERO: 0,
  ONE: 1,
  NEGATIVE: -1,
  MINUS_ZERO: -0,
  INFINITY: Infinity,
  NEGATIVE_INFINITY: -Infinity,
  NaN: NaN,
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  MIN_VALUE: Number.MIN_VALUE,
  MAX_VALUE: Number.MAX_VALUE,
  EPSILON: Number.EPSILON,
} as const;

const ERROR_CASES = {
  // [change, basePrice, expectedPercent, description]
  BASE_PRICE_ERROR: [
    [10, 0, "0.00", "zero base price"],
    [10, -100, "0.00", "negative base price"],
    [-5, 0, "0.00", "zero base price with negative change"],
  ],
} as const;

// ============================================================
// Test Factories
// ============================================================

const createStockChangeInfo = (
  change: number,
  basePrice: number,
  overrides?: Partial<StockChangeInfo>
): StockChangeInfo => {
  const expectedTrend: Trend = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const expectedColor = expectedTrend === "up" ? COLOR_DOMAIN.UP : expectedTrend === "down" ? COLOR_DOMAIN.DOWN : COLOR_DOMAIN.FLAT;
  const expectedPercent = basePrice > 0 ? ((change / basePrice) * 100).toFixed(2) : "0.00";

  return {
    isUp: change > 0,
    isDown: change < 0,
    trend: expectedTrend,
    changeColor: expectedColor,
    changePercent: expectedPercent,
    ...overrides,
  };
};

// ============================================================
// Test Suites
// ============================================================

describe("stockDisplay utilities", () => {
  describe("Trend type", () => {
    it("should have valid trend values", () => {
      const trends: Trend[] = TREND_DOMAIN.VALUES;

      expect(trends).toContain(TREND_DOMAIN.UP);
      expect(trends).toContain(TREND_DOMAIN.DOWN);
      expect(trends).toContain(TREND_DOMAIN.FLAT);
    });

    it.each(TREND_DOMAIN.VALUES)("should support trend value: %s", (trend) => {
      const info: StockChangeInfo = {
        isUp: trend === TREND_DOMAIN.UP,
        isDown: trend === TREND_DOMAIN.DOWN,
        trend,
        changeColor: trend === TREND_DOMAIN.UP ? COLOR_DOMAIN.UP : trend === TREND_DOMAIN.DOWN ? COLOR_DOMAIN.DOWN : COLOR_DOMAIN.FLAT,
        changePercent: "0.00",
      };

      expect(info.trend).toBe(trend);
    });
  });

  describe("StockChangeInfo interface", () => {
    it("should have correct shape for up trend", () => {
      const info: StockChangeInfo = {
        isUp: true,
        isDown: false,
        trend: TREND_DOMAIN.UP,
        changeColor: COLOR_DOMAIN.UP,
        changePercent: "2.50",
      };

      expect(info.isUp).toBe(true);
      expect(info.isDown).toBe(false);
      expect(info.trend).toBe(TREND_DOMAIN.UP);
      expect(info.changeColor).toBe(COLOR_DOMAIN.UP);
      expect(info.changePercent).toBe("2.50");
    });

    it("should have correct shape for down trend", () => {
      const info: StockChangeInfo = {
        isUp: false,
        isDown: true,
        trend: TREND_DOMAIN.DOWN,
        changeColor: COLOR_DOMAIN.DOWN,
        changePercent: "-3.75",
      };

      expect(info.isUp).toBe(false);
      expect(info.isDown).toBe(true);
      expect(info.trend).toBe(TREND_DOMAIN.DOWN);
      expect(info.changeColor).toBe(COLOR_DOMAIN.DOWN);
      expect(info.changePercent).toBe("-3.75");
    });

    it("should have correct shape for flat trend", () => {
      const info: StockChangeInfo = {
        isUp: false,
        isDown: false,
        trend: TREND_DOMAIN.FLAT,
        changeColor: COLOR_DOMAIN.FLAT,
        changePercent: "0.00",
      };

      expect(info.isUp).toBe(false);
      expect(info.isDown).toBe(false);
      expect(info.trend).toBe(TREND_DOMAIN.FLAT);
      expect(info.changeColor).toBe(COLOR_DOMAIN.FLAT);
      expect(info.changePercent).toBe("0.00");
    });
  });

  describe("getStockChangeInfo", () => {
    // ============================================================
    // Positive Change Tests (Up Trend)
    // ============================================================
    describe("positive change (up trend)", () => {
      it("should identify positive change as up trend", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.MEDIUM;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.isUp).toBe(true);
        expect(result.isDown).toBe(false);
        expect(result.trend).toBe(TREND_DOMAIN.UP);
      });

      it("should return green color for up trend", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.MEDIUM;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changeColor).toBe(COLOR_DOMAIN.UP);
      });

      it.each([
        [0.001, 100, "0.00"],
        [0.5, 100, "0.50"],
        [1, 100, "1.00"],
        [5, 200, "2.50"],
        [10, 100, "10.00"],
        [50, 100, "50.00"],
        [150, 100, "150.00"],
      ])("should calculate correct percentage: change=%i, basePrice=%i -> %s%%", (change, basePrice, expected) => {
        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changePercent).toBe(expected);
      });

      it("should handle very small positive change", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.SMALL_POSITIVE;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changePercent).toBe("0.00");
        expect(result.isUp).toBe(true);
      });

      it("should handle large positive change", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.EXTRA_LARGE;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changePercent).toBe("150.00");
        expect(result.isUp).toBe(true);
      });
    });

    // ============================================================
    // Negative Change Tests (Down Trend)
    // ============================================================
    describe("negative change (down trend)", () => {
      it("should identify negative change as down trend", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE_NEGATIVE.MEDIUM;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.isUp).toBe(false);
        expect(result.isDown).toBe(true);
        expect(result.trend).toBe(TREND_DOMAIN.DOWN);
      });

      it("should return red color for down trend", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE_NEGATIVE.MEDIUM;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changeColor).toBe(COLOR_DOMAIN.DOWN);
      });

      it("should calculate correct percentage: change=-0, basePrice=100 -> 0.00%", () => {
        // Act
        const result = getStockChangeInfo(-0, 100);

        // Assert - -0 is treated as 0
        expect(result.changePercent).toBe("0.00");
        expect(result.trend).toBe("flat");
      });

      it("should calculate correct percentage: change=-0.5, basePrice=100 -> -0.50%", () => {
        // Act
        const result = getStockChangeInfo(-0.5, 100);

        // Assert
        expect(result.changePercent).toBe("-0.50");
      });

      it("should calculate correct percentage: change=-1, basePrice=100 -> -1.00%", () => {
        // Act
        const result = getStockChangeInfo(-1, 100);

        // Assert
        expect(result.changePercent).toBe("-1.00");
      });

      it("should calculate correct percentage: change=-5, basePrice=200 -> -2.50%", () => {
        // Act
        const result = getStockChangeInfo(-5, 200);

        // Assert
        expect(result.changePercent).toBe("-2.50");
      });

      it("should calculate correct percentage: change=-10, basePrice=100 -> -10.00%", () => {
        // Act
        const result = getStockChangeInfo(-10, 100);

        // Assert
        expect(result.changePercent).toBe("-10.00");
      });

      it("should calculate correct percentage: change=-50, basePrice=100 -> -50.00%", () => {
        // Act
        const result = getStockChangeInfo(-50, 100);

        // Assert
        expect(result.changePercent).toBe("-50.00");
      });

      it("should calculate correct percentage: change=-75, basePrice=100 -> -75.00%", () => {
        // Act
        const result = getStockChangeInfo(-75, 100);

        // Assert
        expect(result.changePercent).toBe("-75.00");
      });

      it("should handle very small negative change", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE_NEGATIVE.SMALL_NEGATIVE;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert - change is negative, so isDown should be true
        expect(result.isDown).toBe(true);
        expect(result.trend).toBe("down");
      });

      it("should handle large negative change", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE_NEGATIVE.EXTRA_LARGE;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changePercent).toBe("-75.00");
        expect(result.isDown).toBe(true);
      });
    });

    // ============================================================
    // Zero Change Tests (Flat Trend)
    // ============================================================
    describe("zero change (flat trend)", () => {
      it("should identify zero change as flat trend", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.ZERO;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.isUp).toBe(false);
        expect(result.isDown).toBe(false);
        expect(result.trend).toBe(TREND_DOMAIN.FLAT);
      });

      it("should return muted color for flat trend", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.ZERO;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changeColor).toBe(COLOR_DOMAIN.FLAT);
      });

      it("should return 0.00 percent for flat trend", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.ZERO;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changePercent).toBe("0.00");
      });

      it("should handle minus zero as flat trend", () => {
        // Arrange
        const change = EDGE_NUMBERS.MINUS_ZERO;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.trend).toBe(TREND_DOMAIN.FLAT);
      });
    });

    // ============================================================
    // Edge Cases - Invalid Base Price
    // ============================================================
    describe("edge cases - invalid base price", () => {
      it.each(ERROR_CASES.BASE_PRICE_ERROR)(
        "should return 0.00 when %s",
        (change, basePrice, expected) => {
          // Act
          const result = getStockChangeInfo(change, basePrice);

          // Assert
          expect(result.changePercent).toBe(expected);
        }
      );

      it("should return up trend when change > 0 regardless of base price", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.MEDIUM; // 5 > 0
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.ZERO;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert - trend is determined by change sign, not basePrice
        expect(result.trend).toBe("up");
        expect(result.changePercent).toBe("0.00");
      });

      it("should return up trend when change > 0 even with negative base price", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.MEDIUM; // 5 > 0
        const basePrice = -BOUNDARY_VALUES.BASE_PRICE.MEDIUM; // -100 < 0

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert - trend is determined by change sign (positive), basePrice only affects percent
        expect(result.trend).toBe("up");
        expect(result.changePercent).toBe("0.00");
      });
    });

    // ============================================================
    // Precision and Rounding Tests
    // ============================================================
    describe("precision and rounding", () => {
      it.each([
        [5, 200, "2.50"],
        [10, 100, "10.00"],
        [1, 3, "33.33"],
        [2, 3, "66.67"],
        [-5, 200, "-2.50"],
        [-75, 100, "-75.00"],
        [150, 100, "150.00"],
      ])(
        "should calculate %i / %i = %s%% correctly",
        (change, basePrice, expected) => {
          // Act
          const result = getStockChangeInfo(change, basePrice);

          // Assert
          expect(result.changePercent).toBe(expected);
        }
      );

      it("should handle repeating decimal correctly", () => {
        // Arrange
        const change = 1;
        const basePrice = 3;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result.changePercent).toBe("33.33");
      });

      it("should handle precision with various decimal places", () => {
        // Arrange & Act & Assert
        expect(getStockChangeInfo(1, 7, 0).changePercent).toBeDefined();
        expect(getStockChangeInfo(22, 7, 0).changePercent).toBeDefined();
      });
    });

    // ============================================================
    // Consistency Tests
    // ============================================================
    describe("consistency", () => {
      it("should produce consistent results for same inputs", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.MEDIUM;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.LARGE;

        // Act
        const result1 = getStockChangeInfo(change, basePrice);
        const result2 = getStockChangeInfo(change, basePrice);

        // Assert
        expect(result1.changePercent).toBe(result2.changePercent);
        expect(result1.trend).toBe(result2.trend);
        expect(result1.changeColor).toBe(result2.changeColor);
      });

      it("should produce different results for opposite changes", () => {
        // Arrange
        const positiveChange = BOUNDARY_VALUES.CHANGE.MEDIUM;
        const negativeChange = BOUNDARY_VALUES.CHANGE_NEGATIVE.MEDIUM;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result1 = getStockChangeInfo(positiveChange, basePrice);
        const result2 = getStockChangeInfo(negativeChange, basePrice);

        // Assert
        expect(result1.trend).not.toBe(result2.trend);
        expect(result1.changeColor).not.toBe(result2.changeColor);
      });

      it("should produce different results for different base prices", () => {
        // Arrange
        const change = BOUNDARY_VALUES.CHANGE.MEDIUM;
        const basePrice1 = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;
        const basePrice2 = BOUNDARY_VALUES.BASE_PRICE.LARGE;

        // Act
        const result1 = getStockChangeInfo(change, basePrice1);
        const result2 = getStockChangeInfo(change, basePrice2);

        // Assert
        expect(result1.changePercent).not.toBe(result2.changePercent);
      });
    });

    // ============================================================
    // Return Type Validation
    // ============================================================
    describe("return type validation", () => {
      it("should always return isUp XOR isDown for non-zero changes", () => {
        // Arrange & Act
        const positiveResult = getStockChangeInfo(10, 100);
        const negativeResult = getStockChangeInfo(-10, 100);

        // Assert
        expect(positiveResult.isUp !== positiveResult.isDown).toBe(true);
        expect(negativeResult.isUp !== negativeResult.isDown).toBe(true);
      });

      it("should return isUp === isDown === false for zero change", () => {
        // Arrange & Act
        const zeroResult = getStockChangeInfo(0, 100);

        // Assert
        expect(zeroResult.isUp).toBe(false);
        expect(zeroResult.isDown).toBe(false);
      });

      it.each(TREND_DOMAIN.VALUES)("should always return valid Trend type for %s", (expectedTrend) => {
        // Arrange
        const change = expectedTrend === "up" ? 1 : expectedTrend === "down" ? -1 : 0;
        const basePrice = BOUNDARY_VALUES.BASE_PRICE.MEDIUM;

        // Act
        const result = getStockChangeInfo(change, basePrice);

        // Assert
        expect(TREND_DOMAIN.VALUES).toContain(result.trend);
        expect(result.trend).toBe(expectedTrend);
      });

      it("should return object with all required properties", () => {
        // Act
        const result = getStockChangeInfo(10, 100);

        // Assert
        expect(result).toHaveProperty("isUp");
        expect(result).toHaveProperty("isDown");
        expect(result).toHaveProperty("trend");
        expect(result).toHaveProperty("changeColor");
        expect(result).toHaveProperty("changePercent");
      });

      it("should return string for changePercent", () => {
        // Act
        const result = getStockChangeInfo(10, 100);

        // Assert
        expect(typeof result.changePercent).toBe("string");
      });

      it("should return string for changeColor", () => {
        // Act
        const result = getStockChangeInfo(10, 100);

        // Assert
        expect(typeof result.changeColor).toBe("string");
      });
    });

    // ============================================================
    // Equivalence Class Tests
    // ============================================================
    describe("equivalence class tests", () => {
      describe("valid inputs - should produce valid results", () => {
        const validCases = [
          { change: 100, basePrice: 100, expectedTrend: "up" },
          { change: -100, basePrice: 100, expectedTrend: "down" },
          { change: 0, basePrice: 100, expectedTrend: "flat" },
          { change: 0.0001, basePrice: 10000, expectedTrend: "up" }, // change > 0 → up
          { change: 1, basePrice: 10000, expectedTrend: "up" },
        ];

        it.each(validCases)(
          "change=$change, basePrice=$basePrice -> trend=$expectedTrend",
          ({ change, basePrice, expectedTrend }) => {
            // Act
            const result = getStockChangeInfo(change, basePrice);

            // Assert
            expect(result.trend).toBe(expectedTrend);
          }
        );
      });

      describe("invalid inputs - edge case handling", () => {
        const invalidCases = [
          { change: 10, basePrice: 0, expectedTrend: "up" },    // change > 0 → up
          { change: 0, basePrice: 0, expectedTrend: "flat" },   // change === 0 → flat
          { change: -10, basePrice: 0, expectedTrend: "down" },  // change < 0 → down
        ];

        it.each(invalidCases)(
          "change=$change, basePrice=$basePrice -> trend=$expectedTrend",
          ({ change, basePrice, expectedTrend }) => {
            // Act
            const result = getStockChangeInfo(change, basePrice);

            // Assert - change determines trend, basePrice only affects percent display
            expect(result.trend).toBe(expectedTrend);
            expect(result.changePercent).toBe("0.00");
          }
        );
      });
    });
  });
});
