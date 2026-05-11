import {
  Trend,
  StockChangeInfo,
  getStockChangeInfo,
} from "../../../presentation/utils/stockDisplay";

describe("stockDisplay utilities", () => {
  describe("Trend type", () => {
    it("should have valid trend values", () => {
      const trends: Trend[] = ["up", "down", "flat"];

      expect(trends).toContain("up");
      expect(trends).toContain("down");
      expect(trends).toContain("flat");
    });
  });

  describe("StockChangeInfo interface", () => {
    it("should have correct shape for up trend", () => {
      const info: StockChangeInfo = {
        isUp: true,
        isDown: false,
        trend: "up",
        changeColor: "#34C759",
        changePercent: "2.50",
      };

      expect(info.isUp).toBe(true);
      expect(info.isDown).toBe(false);
      expect(info.trend).toBe("up");
      expect(info.changeColor).toBe("#34C759");
      expect(info.changePercent).toBe("2.50");
    });

    it("should have correct shape for down trend", () => {
      const info: StockChangeInfo = {
        isUp: false,
        isDown: true,
        trend: "down",
        changeColor: "#FF3B30",
        changePercent: "-3.75",
      };

      expect(info.isUp).toBe(false);
      expect(info.isDown).toBe(true);
      expect(info.trend).toBe("down");
      expect(info.changeColor).toBe("#FF3B30");
      expect(info.changePercent).toBe("-3.75");
    });

    it("should have correct shape for flat trend", () => {
      const info: StockChangeInfo = {
        isUp: false,
        isDown: false,
        trend: "flat",
        changeColor: "rgba(255,255,255,0.5)",
        changePercent: "0.00",
      };

      expect(info.isUp).toBe(false);
      expect(info.isDown).toBe(false);
      expect(info.trend).toBe("flat");
      expect(info.changeColor).toBe("rgba(255,255,255,0.5)");
      expect(info.changePercent).toBe("0.00");
    });
  });

  describe("getStockChangeInfo", () => {
    describe("positive change (up trend)", () => {
      it("should identify positive change as up trend", () => {
        const result = getStockChangeInfo(5, 200);

        expect(result.isUp).toBe(true);
        expect(result.isDown).toBe(false);
        expect(result.trend).toBe("up");
      });

      it("should return green color for up trend", () => {
        const result = getStockChangeInfo(5, 200);

        expect(result.changeColor).toBe("#34C759");
      });

      it("should calculate correct percentage change", () => {
        const result = getStockChangeInfo(5, 200);

        expect(result.changePercent).toBe("2.50");
      });

      it("should handle large positive change", () => {
        const result = getStockChangeInfo(150, 100);

        expect(result.changePercent).toBe("150.00");
        expect(result.isUp).toBe(true);
      });

      it("should handle small positive change", () => {
        const result = getStockChangeInfo(0.5, 100);

        expect(result.changePercent).toBe("0.50");
      });
    });

    describe("negative change (down trend)", () => {
      it("should identify negative change as down trend", () => {
        const result = getStockChangeInfo(-5, 200);

        expect(result.isUp).toBe(false);
        expect(result.isDown).toBe(true);
        expect(result.trend).toBe("down");
      });

      it("should return red color for down trend", () => {
        const result = getStockChangeInfo(-5, 200);

        expect(result.changeColor).toBe("#FF3B30");
      });

      it("should calculate correct negative percentage change", () => {
        const result = getStockChangeInfo(-5, 200);

        expect(result.changePercent).toBe("-2.50");
      });

      it("should handle large negative change", () => {
        const result = getStockChangeInfo(-75, 100);

        expect(result.changePercent).toBe("-75.00");
        expect(result.isDown).toBe(true);
      });

      it("should handle small negative change", () => {
        const result = getStockChangeInfo(-0.5, 100);

        expect(result.changePercent).toBe("-0.50");
      });
    });

    describe("zero change (flat trend)", () => {
      it("should identify zero change as flat trend", () => {
        const result = getStockChangeInfo(0, 200);

        expect(result.isUp).toBe(false);
        expect(result.isDown).toBe(false);
        expect(result.trend).toBe("flat");
      });

      it("should return muted color for flat trend", () => {
        const result = getStockChangeInfo(0, 200);

        expect(result.changeColor).toBe("rgba(255,255,255,0.5)");
      });

      it("should return 0.00 percent for flat trend", () => {
        const result = getStockChangeInfo(0, 200);

        expect(result.changePercent).toBe("0.00");
      });
    });

    describe("edge cases", () => {
      it("should handle zero base price", () => {
        const result = getStockChangeInfo(10, 0);

        expect(result.changePercent).toBe("0.00");
      });

it("should handle negative base price", () => {
      // When basePrice is 0 or negative, the function returns "0.00"
      const result = getStockChangeInfo(10, -100);
      expect(result.changePercent).toBe("0.00");
    });

      it("should handle very small change", () => {
        const result = getStockChangeInfo(0.001, 100);

        expect(result.changePercent).toBe("0.00");
      });

      it("should handle precision with rounding", () => {
        const result = getStockChangeInfo(1, 3);

        expect(result.changePercent).toBe("33.33");
      });
    });

    describe("consistency", () => {
      it("should produce consistent results for same inputs", () => {
        const result1 = getStockChangeInfo(10, 100);
        const result2 = getStockChangeInfo(10, 100);

        expect(result1.changePercent).toBe(result2.changePercent);
        expect(result1.trend).toBe(result2.trend);
        expect(result1.changeColor).toBe(result2.changeColor);
      });

      it("should produce different results for different changes", () => {
        const result1 = getStockChangeInfo(5, 100);
        const result2 = getStockChangeInfo(-5, 100);

        expect(result1.trend).not.toBe(result2.trend);
        expect(result1.changeColor).not.toBe(result2.changeColor);
      });

      it("should produce different results for different base prices", () => {
        const result1 = getStockChangeInfo(10, 100);
        const result2 = getStockChangeInfo(10, 200);

        expect(result1.changePercent).not.toBe(result2.changePercent);
      });
    });

    describe("return type validation", () => {
      it("should always return isUp XOR isDown", () => {
        const positiveResult = getStockChangeInfo(10, 100);
        const negativeResult = getStockChangeInfo(-10, 100);
        const zeroResult = getStockChangeInfo(0, 100);

        expect(positiveResult.isUp !== positiveResult.isDown).toBe(true);
        expect(negativeResult.isUp !== negativeResult.isDown).toBe(true);
        expect(zeroResult.isUp === zeroResult.isDown).toBe(true);
      });

      it("should always return valid Trend type", () => {
        const positiveResult = getStockChangeInfo(10, 100);
        const negativeResult = getStockChangeInfo(-10, 100);
        const zeroResult = getStockChangeInfo(0, 100);

        const validTrends: Trend[] = ["up", "down", "flat"];
        expect(validTrends).toContain(positiveResult.trend);
        expect(validTrends).toContain(negativeResult.trend);
        expect(validTrends).toContain(zeroResult.trend);
      });
    });
  });
});
