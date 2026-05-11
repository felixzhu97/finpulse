import {
  formatPrice,
  formatSigned,
  formatPercent,
  formatSignedPercent,
  getCurrencySymbol,
  formatCompactCurrency,
  formatCurrency,
  formatBalance,
  formatScreenDate,
  formatScreenDateLong,
  formatChartLabel,
  formatChartTooltipDate,
} from "../../../presentation/utils/format";

describe("format utilities", () => {
  describe("formatPrice", () => {
    it("should format price with default 2 decimals", () => {
      expect(formatPrice(1234.56)).toBe("1,234.56");
    });

    it("should format price with custom decimals", () => {
      expect(formatPrice(1234.5678, 3)).toBe("1,234.568");
    });

    it("should format price with 0 decimals", () => {
      expect(formatPrice(1234.56, 0)).toBe("1,235");
    });

    it("should format whole numbers without decimals", () => {
      expect(formatPrice(1000)).toBe("1,000.00");
    });

    it("should handle small decimal values", () => {
      expect(formatPrice(0.123456, 4)).toBe("0.1235");
    });
  });

  describe("formatSigned", () => {
    it("should add plus sign for positive numbers", () => {
      expect(formatSigned(1234.56)).toBe("+1,234.56");
    });

    it("should not add sign for zero", () => {
      expect(formatSigned(0)).toBe("0");
    });

    it("should not add sign for negative numbers (just return value)", () => {
      expect(formatSigned(-1234.56)).toBe("-1,234.56");
    });

    it("should format with custom decimals", () => {
      expect(formatSigned(123.456, 3)).toBe("+123.456");
    });

    it("should handle small positive values", () => {
      expect(formatSigned(0.01)).toBe("+0.01");
    });
  });

  describe("formatPercent", () => {
    it("should format percentage with default 2 decimals", () => {
      expect(formatPercent(0.1234)).toBe("0.12");
    });

    it("should format with custom decimals", () => {
      expect(formatPercent(0.123456, 4)).toBe("0.1235");
    });

    it("should format whole percentages", () => {
      expect(formatPercent(0.5)).toBe("0.50");
    });

    it("should format large percentages", () => {
      expect(formatPercent(150.5)).toBe("150.50");
    });
  });

  describe("formatSignedPercent", () => {
    it("should add plus sign and percent for positive values", () => {
      expect(formatSignedPercent(0.1234)).toBe("+12.34%");
    });

    it("should add minus sign for negative values", () => {
      expect(formatSignedPercent(-0.1234)).toBe("-12.34%");
    });

    it("should return 0.00% for zero", () => {
      expect(formatSignedPercent(0)).toBe("0.00%");
    });

    it("should format with custom decimals", () => {
      expect(formatSignedPercent(0.123456, 4)).toBe("+12.3456%");
    });

    it("should handle large positive values", () => {
      expect(formatSignedPercent(1.5)).toBe("+150.00%");
    });

    it("should handle large negative values", () => {
      expect(formatSignedPercent(-0.5)).toBe("-50.00%");
    });
  });

  describe("getCurrencySymbol", () => {
    it("should return $ for USD", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("should return € for EUR", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("should return £ for GBP", () => {
      expect(getCurrencySymbol("GBP")).toBe("£");
    });

    it("should return ¥ for JPY", () => {
      expect(getCurrencySymbol("JPY")).toBe("¥");
    });

    it("should return ¥ for CNY", () => {
      expect(getCurrencySymbol("CNY")).toBe("¥");
    });

    it("should return currency code with space for unknown currencies", () => {
      expect(getCurrencySymbol("BTC")).toBe("BTC ");
    });

    it("should return currency code with space for CHF", () => {
      expect(getCurrencySymbol("CHF")).toBe("CHF ");
    });
  });

  describe("formatCompactCurrency", () => {
    it("should format billions with B suffix", () => {
      expect(formatCompactCurrency(1500000000, "USD")).toBe("$1.50B");
    });

    it("should format millions with M suffix", () => {
      expect(formatCompactCurrency(2500000, "USD")).toBe("$2.50M");
    });

    it("should format thousands with K suffix", () => {
      expect(formatCompactCurrency(5500, "USD")).toBe("$5.50K");
    });

    it("should format small values without suffix", () => {
      expect(formatCompactCurrency(500, "USD")).toBe("$500");
    });

    it("should handle exact billion values", () => {
      expect(formatCompactCurrency(1000000000, "EUR")).toBe("€1.00B");
    });

    it("should handle exact million values", () => {
      expect(formatCompactCurrency(1000000, "GBP")).toBe("£1.00M");
    });

    it("should handle exact thousand values", () => {
      expect(formatCompactCurrency(1000, "JPY")).toBe("¥1.00K");
    });

    it("should handle zero", () => {
      expect(formatCompactCurrency(0, "USD")).toBe("$0");
    });
  });

  describe("formatCurrency", () => {
    it("should format with default 0 decimals", () => {
      expect(formatCurrency(1234567, "USD")).toBe("USD 1,234,567");
    });

    it("should format with custom decimals", () => {
      expect(formatCurrency(1234567.89, "USD", 2)).toBe("USD 1,234,567.89");
    });

    it("should handle small values", () => {
      expect(formatCurrency(0.99, "EUR", 2)).toBe("EUR 0.99");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0, "JPY")).toBe("JPY 0");
    });
  });

  describe("formatBalance", () => {
    it("should format balance without decimals", () => {
      expect(formatBalance(1234567)).toBe("1,234,567");
    });

    it("should round to whole numbers", () => {
      expect(formatBalance(1234567.89)).toBe("1,234,568");
    });

    it("should format small balances", () => {
      expect(formatBalance(999)).toBe("999");
    });

    it("should format zero", () => {
      expect(formatBalance(0)).toBe("0");
    });
  });

  describe("formatScreenDate", () => {
    it("should format date with month and day", () => {
      const date = new Date("2024-01-15");
      expect(formatScreenDate(date)).toBe("January 15");
    });

    it("should format with custom locale", () => {
      const date = new Date("2024-03-20");
      expect(formatScreenDate(date, "zh-CN")).toContain("3");
    });

    it("should format December dates", () => {
      const date = new Date("2024-12-25");
      const result = formatScreenDate(date);
      expect(result).toContain("December");
      expect(result).toContain("25");
    });
  });

  describe("formatScreenDateLong", () => {
    it("should format date with full components", () => {
      const date = new Date("2024-01-15");
      const result = formatScreenDateLong(date);
      expect(result).toContain("January");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("should include weekday", () => {
      const date = new Date("2024-01-15");
      const result = formatScreenDateLong(date);
      expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });

    it("should format with custom locale", () => {
      const date = new Date("2024-03-20");
      formatScreenDateLong(date, "ja");
    });
  });

  describe("formatChartLabel", () => {
    it("should format date with short month and day", () => {
      const date = new Date("2024-01-15");
      expect(formatChartLabel(date)).toBe("Jan 15");
    });

    it("should format December dates", () => {
      const date = new Date("2024-12-25");
      const result = formatChartLabel(date);
      expect(result).toContain("Dec");
      expect(result).toContain("25");
    });
  });

  describe("formatChartTooltipDate", () => {
    it("should format date with short month, day, and year", () => {
      const date = new Date("2024-01-15");
      expect(formatChartTooltipDate(date)).toBe("Jan 15, 2024");
    });

    it("should format year correctly", () => {
      const date = new Date("2023-06-30");
      const result = formatChartTooltipDate(date);
      expect(result).toContain("2023");
    });
  });
});
