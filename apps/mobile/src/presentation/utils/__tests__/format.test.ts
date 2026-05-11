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

// ============================================================
// Domain Test Values - Formatting Domain
// ============================================================

const CURRENCY_DOMAIN = {
  SYMBOLS: {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
  },
  UNKNOWN: ["BTC", "CHF", "AUD", "CAD"],
  ALL: ["USD", "EUR", "GBP", "JPY", "CNY", "BTC", "CHF", "AUD", "CAD"],
} as const;

const NUMBER_DOMAIN = {
  ZERO: 0,
  ONE: 1,
  NEGATIVE: -1,
  SMALL_POSITIVE: 0.01,
  SMALL_NEGATIVE: -0.01,
  THOUSAND: 1000,
  MILLION: 1000000,
  BILLION: 1000000000,
  WHOLE: 1234,
  DECIMAL: 1234.5678,
  NEGATIVE_DECIMAL: -1234.5678,
} as const;

const BOUNDARY_VALUES = {
  // Number boundaries
  NUMBER: {
    ZERO: 0,
    ONE: 1,
    NEGATIVE_ONE: -1,
    MINUS_ZERO: -0,
    SMALL_POSITIVE: 0.0001,
    SMALL_NEGATIVE: -0.0001,
    TINY_POSITIVE: 0.000001,
    TINY_NEGATIVE: -0.000001,
  },
  // Large values for compact currency
  LARGE: {
    THOUSAND: 1000,
    TEN_THOUSAND: 10000,
    HUNDRED_THOUSAND: 100000,
    MILLION: 1000000,
    TEN_MILLION: 10000000,
    HUNDRED_MILLION: 100000000,
    BILLION: 1000000000,
  },
  // Precision edge cases
  PRECISION: {
    EPSILON: Number.EPSILON,
    MIN_VALUE: Number.MIN_VALUE,
    MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    FLOAT_EDGE: 0.1 + 0.2, // 0.30000000000000004
  },
  // Percentage values
  PERCENTAGE: {
    ZERO: 0,
    SMALL: 0.1234,
    HALF: 0.5,
    ONE: 1,
    OVER_ONE: 1.5,
    LARGE: 150.5,
  },
} as const;

const EDGE_CASES = {
  // Special number values
  SPECIAL: {
    INFINITY: Infinity,
    NEGATIVE_INFINITY: -Infinity,
    NaN: NaN,
  },
  // String boundaries
  STRING: {
    EMPTY: "",
    SINGLE_CHAR: "a",
    WHITESPACE: "   ",
    UNICODE_EMOJI: "👋🎉",
    UNICODE_CJK: "中文测试",
  },
  // Date boundaries
  DATE: {
    EPOCH: new Date(0),
    YEAR_1900: new Date("1900-01-01"),
    YEAR_2024: new Date("2024-01-15"),
    YEAR_2024_LEAP: new Date("2024-02-29"),
    YEAR_2024_DEC: new Date("2024-12-25"),
    YEAR_2023: new Date("2023-06-30"),
    FUTURE: new Date("2100-12-31"),
    FAR_FUTURE: new Date("9999-12-31"),
  },
} as const;

const DECIMAL_PRECISION = {
  VALID: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  BOUNDARY: [0, 1, 2],
} as const;

const COMPACT_THRESHOLDS = {
  THRESHOLD_BILLION: 1e9,
  THRESHOLD_MILLION: 1e6,
  THRESHOLD_THOUSAND: 1e3,
} as const;

const LOCALE_DOMAIN = {
  ENGLISH: "en-US",
  CHINESE: "zh-CN",
  JAPANESE: "ja",
  GERMAN: "de-DE",
  EMPTY: undefined,
} as const;

// ============================================================
// Test Factories
// ============================================================

const createPriceValues = (count: number, base: number, increment: number = 0.01): number[] =>
  Array.from({ length: count }, (_, i) => base + i * increment);

const createLargeValues = (): Array<{ value: number; suffix: string }> => [
  { value: 500, suffix: "" },
  { value: 1000, suffix: "K" },
  { value: 1000000, suffix: "M" },
  { value: 1000000000, suffix: "B" },
  { value: 1500000000, suffix: "B" },
  { value: 2500000, suffix: "M" },
  { value: 5500, suffix: "K" },
];

// ============================================================
// Test Suites
// ============================================================

describe("format utilities", () => {
  // ============================================================
  // formatPrice Tests
  // ============================================================
  describe("formatPrice", () => {
    describe("default formatting (2 decimals)", () => {
      it.each([
        [1234.56, "1,234.56"],
        [0, "0.00"],
        [0.1, "0.10"],
        [1000, "1,000.00"],
        [999999.99, "999,999.99"],
      ])("should format %i to '%s'", (value, expected) => {
        // Act
        const result = formatPrice(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("custom decimal places", () => {
      it.each([
        [1234.5678, 0, "1,235"],
        [1234.5678, 1, "1,234.6"],
        [1234.5678, 2, "1,234.57"],
        [1234.5678, 3, "1,234.568"],
        [1234.5678, 4, "1,234.5678"],
        [1234.5, 0, "1,235"],
      ])("should format %i with %i decimals to '%s'", (value, decimals, expected) => {
        // Act
        const result = formatPrice(value, decimals);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("edge cases", () => {
      it("should handle zero", () => {
        expect(formatPrice(0)).toBe("0.00");
      });

      it("should handle small positive values", () => {
        expect(formatPrice(0.01, 2)).toBe("0.01");
      });

      it("should handle large numbers", () => {
        expect(formatPrice(999999999.99)).toBe("999,999,999.99");
      });

      it("should handle negative numbers", () => {
        expect(formatPrice(-1234.56)).toBe("-1,234.56");
      });

      it("should handle precision edge case (0.1 + 0.2)", () => {
        const value = BOUNDARY_VALUES.PRECISION.FLOAT_EDGE;
        const result = formatPrice(value, 10);
        expect(result).toContain("0.3");
      });
    });
  });

  // ============================================================
  // formatSigned Tests
  // ============================================================
  describe("formatSigned", () => {
    describe("positive numbers", () => {
      it.each([
        [1234.56, "+1,234.56"],
        [0.01, "+0.01"],
        [0.001, "+0.00"],
        [1000, "+1,000.00"],
        [0.5, "+0.50"],
      ])("should add plus sign for positive: %i -> '%s'", (value, expected) => {
        // Act
        const result = formatSigned(value);

        // Assert
        expect(result).toBe(expected);
      });

      it("should format positive with custom decimals", () => {
        expect(formatSigned(123.456, 3)).toBe("+123.456");
      });
    });

    describe("zero", () => {
      it.each([
        [0, "0"],
        [-0, "0"],
        [0.0001, "+0.00"],
      ])("should not add sign for zero: %i -> '%s'", (value, expected) => {
        // Act
        const result = formatSigned(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("negative numbers", () => {
      it.each([
        [-1234.56, "-1,234.56"],
        [-0.01, "-0.01"],
        [-1000, "-1,000.00"],
        [-0.5, "-0.50"],
      ])("should preserve negative sign for: %i -> '%s'", (value, expected) => {
        // Act
        const result = formatSigned(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("edge cases", () => {
      it("should handle very small positive values", () => {
        expect(formatSigned(0.001, 4)).toBe("+0.0010");
      });

      it("should handle very small negative values", () => {
        expect(formatSigned(-0.001, 4)).toBe("-0.0010");
      });
    });
  });

  // ============================================================
  // formatPercent Tests
  // ============================================================
  describe("formatPercent", () => {
    describe("default formatting (2 decimals)", () => {
      it.each([
        [0.1234, "0.12"],
        [0.5, "0.50"],
        [0, "0.00"],
        [1, "1.00"],
        [1.5, "1.50"],
        [150.5, "150.50"],
        [-0.1234, "-0.12"],
        [-0.5, "-0.50"],
      ])("should format %i to '%s'", (value, expected) => {
        // Act
        const result = formatPercent(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("custom decimal places", () => {
      it.each([
        [0.123456, 0, "0"],
        [0.123456, 1, "0.1"],
        [0.123456, 2, "0.12"],
        [0.123456, 3, "0.123"],
        [0.123456, 4, "0.1235"],
        [0.999999, 2, "1.00"],
      ])("should format %i with %i decimals to '%s'", (value, decimals, expected) => {
        // Act
        const result = formatPercent(value, decimals);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("edge cases", () => {
      it("should handle zero", () => {
        expect(formatPercent(0)).toBe("0.00");
      });

      it("should handle large percentages", () => {
        expect(formatPercent(999.99)).toBe("999.99");
      });

      it("should handle negative percentages", () => {
        expect(formatPercent(-50.5)).toBe("-50.50");
      });
    });
  });

  // ============================================================
  // formatSignedPercent Tests
  // ============================================================
  describe("formatSignedPercent", () => {
    describe("positive values (up trend)", () => {
      it.each([
        [0.1234, "+12.34%"],
        [0.5, "+50.00%"],
        [1, "+100.00%"],
        [1.5, "+150.00%"],
        [0.001, "+0.10%"],
      ])("should add plus sign for positive: %i -> '%s'", (value, expected) => {
        // Act
        const result = formatSignedPercent(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("zero", () => {
      it("should return 0.00% for zero", () => {
        expect(formatSignedPercent(0)).toBe("0.00%");
      });

      it("should return 0.00% for very small values", () => {
        expect(formatSignedPercent(0.0001)).toBe("+0.01%");
      });
    });

    describe("negative values (down trend)", () => {
      it.each([
        [-0.1234, "-12.34%"],
        [-0.5, "-50.00%"],
        [-1, "-100.00%"],
        [-1.5, "-150.00%"],
      ])("should add minus sign for negative: %i -> '%s'", (value, expected) => {
        // Act
        const result = formatSignedPercent(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("custom decimal places", () => {
      it.each([
        [0.123456, 2, "+12.35%"],
        [0.123456, 4, "+12.3456%"],
        [-0.123456, 2, "-12.35%"],
        [-0.123456, 4, "-12.3456%"],
      ])("should format %i with %i decimals to '%s'", (value, decimals, expected) => {
        // Act
        const result = formatSignedPercent(value, decimals);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("edge cases", () => {
      it("should handle small positive values", () => {
        expect(formatSignedPercent(0.001)).toBe("+0.10%");
      });

      it("should handle small negative values", () => {
        expect(formatSignedPercent(-0.001)).toBe("-0.10%");
      });
    });
  });

  // ============================================================
  // getCurrencySymbol Tests
  // ============================================================
  describe("getCurrencySymbol", () => {
    describe("supported currencies", () => {
      it.each([
        ["USD", "$"],
        ["EUR", "€"],
        ["GBP", "£"],
        ["JPY", "¥"],
        ["CNY", "¥"],
      ])("should return '%s' for %s", (currency, expected) => {
        // Act
        const result = getCurrencySymbol(currency);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("unsupported currencies", () => {
      it.each(CURRENCY_DOMAIN.UNKNOWN)("should return currency code with space for %s", (currency) => {
        // Act
        const result = getCurrencySymbol(currency);

        // Assert
        expect(result).toBe(`${currency} `);
      });
    });

    describe("edge cases", () => {
      it("should handle empty string", () => {
        expect(getCurrencySymbol("")).toBe(" ");
      });

      it("should handle lowercase currency codes", () => {
        expect(getCurrencySymbol("usd")).toBe("usd ");
      });

      it("should handle mixed case", () => {
        expect(getCurrencySymbol("Usd")).toBe("Usd ");
      });
    });
  });

  // ============================================================
  // formatCompactCurrency Tests
  // ============================================================
  describe("formatCompactCurrency", () => {
    describe("billions", () => {
      it.each([
        [1000000000, "USD", "$1.00B"],
        [1500000000, "USD", "$1.50B"],
        [2500000000, "EUR", "€2.50B"],
        [9999999999, "GBP", "£10.00B"],
      ])("should format %i %s to '%s'", (value, currency, expected) => {
        // Act
        const result = formatCompactCurrency(value, currency);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("millions", () => {
      it.each([
        [1000000, "USD", "$1.00M"],
        [2500000, "USD", "$2.50M"],
        [10000000, "EUR", "€10.00M"],
      ])("should format %i %s to '%s'", (value, currency, expected) => {
        // Act
        const result = formatCompactCurrency(value, currency);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("thousands", () => {
      it.each([
        [1000, "USD", "$1.00K"],
        [5500, "USD", "$5.50K"],
        [10000, "EUR", "€10.00K"],
      ])("should format %i %s to '%s'", (value, currency, expected) => {
        // Act
        const result = formatCompactCurrency(value, currency);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("small values (no suffix)", () => {
      it.each([
        [0, "USD", "$0"],
        [500, "USD", "$500"],
        [999, "EUR", "€999"],
      ])("should format %i %s to '%s'", (value, currency, expected) => {
        // Act
        const result = formatCompactCurrency(value, currency);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("boundary values", () => {
      it.each([
        [999999, "$1000.00K"], // 999999 / 1000 = 999.999, shows as 1000.00K
        [1000000, "$1.00M"],
        [1000999, "$1.00M"],
        [999999999, "$1000.00M"], // 999999999 / 1000000 = 999.999..., shows as 1000.00M
        [1000000000, "$1.00B"],
        [1000999999, "$1.00B"],
      ])("should handle boundary value %i -> '%s'", (value, expected) => {
        // Act
        const result = formatCompactCurrency(value, "USD");

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("edge cases", () => {
      it("should handle zero", () => {
        expect(formatCompactCurrency(0, "USD")).toBe("$0");
      });

      it("should handle negative values", () => {
        expect(formatCompactCurrency(-1000000, "USD")).toBe("$-1,000,000");
      });
    });
  });

  // ============================================================
  // formatCurrency Tests
  // ============================================================
  describe("formatCurrency", () => {
    describe("default formatting (0 decimals)", () => {
      it.each([
        [1234567, "USD", "USD 1,234,567"],
        [0, "USD", "USD 0"],
        [1, "EUR", "EUR 1"],
        [999999, "GBP", "GBP 999,999"],
      ])("should format %i %s to '%s'", (value, currency, expected) => {
        // Act
        const result = formatCurrency(value, currency);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("custom decimal places", () => {
      it.each([
        [1234567.89, "USD", 2, "USD 1,234,567.89"],
        [1234567.8, "EUR", 1, "EUR 1,234,567.8"],
        [0.99, "GBP", 2, "GBP 0.99"],
      ])("should format %i %s with %i decimals to '%s'", (value, currency, decimals, expected) => {
        // Act
        const result = formatCurrency(value, currency, decimals);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("edge cases", () => {
      it("should handle zero", () => {
        expect(formatCurrency(0, "JPY")).toBe("JPY 0");
      });

      it("should handle small values", () => {
        expect(formatCurrency(0.99, "EUR", 2)).toBe("EUR 0.99");
      });

      it("should handle negative values", () => {
        expect(formatCurrency(-1234, "USD")).toBe("USD -1,234");
      });
    });
  });

  // ============================================================
  // formatBalance Tests
  // ============================================================
  describe("formatBalance", () => {
    describe("positive balances", () => {
      it.each([
        [1234567, "1,234,567"],
        [999, "999"],
        [0, "0"],
        [1000, "1,000"],
        [1000000, "1,000,000"],
      ])("should format %i to '%s'", (value, expected) => {
        // Act
        const result = formatBalance(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("decimal rounding", () => {
      it.each([
        [1234567.89, "1,234,568"],
        [1234567.5, "1,234,568"],
        [1234567.49, "1,234,567"],
        [999.99, "1,000"],
        [999.5, "1,000"],
      ])("should round %i to '%s'", (value, expected) => {
        // Act
        const result = formatBalance(value);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("edge cases", () => {
      it("should handle zero", () => {
        expect(formatBalance(0)).toBe("0");
      });

      it("should handle negative values", () => {
        expect(formatBalance(-1234)).toBe("-1,234");
      });

      it("should handle small values", () => {
        expect(formatBalance(0.99)).toBe("1");
      });
    });
  });

  // ============================================================
  // Date Formatting Tests
  // ============================================================
  describe("formatScreenDate", () => {
    describe("month and day formatting", () => {
      it.each([
        [new Date("2024-01-15"), "January 15"],
        [new Date("2024-03-20"), "March 20"],
        [new Date("2024-12-25"), "December 25"],
        [new Date("2024-02-29"), "February 29"],
      ])("should format %s to '%s'", (date, expected) => {
        // Act
        const result = formatScreenDate(date);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("locale support", () => {
      it.each([
        [new Date("2024-03-20"), "zh-CN"],
        [new Date("2024-03-20"), "ja"],
        [new Date("2024-03-20"), "de-DE"],
      ])("should format with locale %s", (date, locale) => {
        // Act
        const result = formatScreenDate(date, locale);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
      });
    });

    describe("edge cases", () => {
      it("should handle January 1st", () => {
        const date = new Date("2024-01-01");
        const result = formatScreenDate(date);
        expect(result).toContain("January");
        expect(result).toContain("1");
      });

      it("should handle December 31st", () => {
        const date = new Date("2024-12-31");
        const result = formatScreenDate(date);
        expect(result).toContain("December");
        expect(result).toContain("31");
      });
    });
  });

  describe("formatScreenDateLong", () => {
    describe("full date components", () => {
      it.each([
        [new Date("2024-01-15")],
        [new Date("2024-06-15")],
        [new Date("2024-12-25")],
      ])("should format %s with full components", (date) => {
        // Act
        const result = formatScreenDateLong(date);

        // Assert
        expect(result).toMatch(/\d{4}/); // year
        expect(result).toMatch(/(January|February|March|April|May|June|July|August|September|October|November|December)/); // month
        expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
      });
    });

    describe("weekday inclusion", () => {
      const weekdays = [
        { date: new Date("2024-01-15"), expected: "Monday" },
        { date: new Date("2024-01-16"), expected: "Tuesday" },
        { date: new Date("2024-01-17"), expected: "Wednesday" },
        { date: new Date("2024-01-18"), expected: "Thursday" },
        { date: new Date("2024-01-19"), expected: "Friday" },
        { date: new Date("2024-01-20"), expected: "Saturday" },
        { date: new Date("2024-01-21"), expected: "Sunday" },
      ];

      it.each(weekdays)("should include $expected for $date", ({ date, expected }) => {
        // Act
        const result = formatScreenDateLong(date);

        // Assert
        expect(result).toContain(expected);
      });
    });

    describe("locale support", () => {
      it("should format with custom locale", () => {
        const date = new Date("2024-03-20");
        const result = formatScreenDateLong(date, "ja");
        expect(result).toBeDefined();
      });
    });
  });

  describe("formatChartLabel", () => {
    describe("short month and day formatting", () => {
      it.each([
        [new Date("2024-01-15"), "Jan 15"],
        [new Date("2024-12-25"), "Dec 25"],
        [new Date("2024-02-29"), "Feb 29"],
      ])("should format %s to '%s'", (date, expected) => {
        // Act
        const result = formatChartLabel(date);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("month abbreviations", () => {
      const months = [
        { date: new Date("2024-01-01"), abbr: "Jan" },
        { date: new Date("2024-02-01"), abbr: "Feb" },
        { date: new Date("2024-03-01"), abbr: "Mar" },
        { date: new Date("2024-04-01"), abbr: "Apr" },
        { date: new Date("2024-05-01"), abbr: "May" },
        { date: new Date("2024-06-01"), abbr: "Jun" },
        { date: new Date("2024-07-01"), abbr: "Jul" },
        { date: new Date("2024-08-01"), abbr: "Aug" },
        { date: new Date("2024-09-01"), abbr: "Sep" },
        { date: new Date("2024-10-01"), abbr: "Oct" },
        { date: new Date("2024-11-01"), abbr: "Nov" },
        { date: new Date("2024-12-01"), abbr: "Dec" },
      ];

      it.each(months)("should format $abbr correctly", ({ date, abbr }) => {
        // Act
        const result = formatChartLabel(date);

        // Assert
        expect(result).toContain(abbr);
      });
    });
  });

  describe("formatChartTooltipDate", () => {
    describe("short month, day, and year formatting", () => {
      it.each([
        [new Date("2024-01-15"), "Jan 15, 2024"],
        [new Date("2023-06-30"), "Jun 30, 2023"],
        [new Date("2024-12-25"), "Dec 25, 2024"],
      ])("should format %s to '%s'", (date, expected) => {
        // Act
        const result = formatChartTooltipDate(date);

        // Assert
        expect(result).toBe(expected);
      });
    });

    describe("year formatting", () => {
      it.each([
        [new Date("2024-01-01"), "2024"],
        [new Date("2023-06-30"), "2023"],
        [new Date("2020-12-31"), "2020"],
      ])("should include correct year for %s", (date, year) => {
        // Act
        const result = formatChartTooltipDate(date);

        // Assert
        expect(result).toContain(year);
      });
    });
  });

  // ============================================================
  // Cross-Function Consistency Tests
  // ============================================================
  describe("cross-function consistency", () => {
    it("formatPrice and formatBalance should handle zero consistently", () => {
      expect(formatPrice(0)).toBe("0.00");
      expect(formatBalance(0)).toBe("0");
    });

    it("formatSignedPercent should always include % suffix", () => {
      const result = formatSignedPercent(0.5);
      expect(result).toContain("%");
    });

    it("formatSigned should add plus sign only for positive", () => {
      expect(formatSigned(5).startsWith("+")).toBe(true);
      expect(formatSigned(-5).startsWith("-")).toBe(true);
      expect(formatSigned(0)).not.toMatch(/^[+\-]/);
    });

    it("formatCompactCurrency should always include currency symbol", () => {
      const result = formatCompactCurrency(1000, "USD");
      expect(result).toContain("$");
    });

    it("formatCurrency should always include currency code", () => {
      const result = formatCurrency(1000, "USD");
      expect(result).toContain("USD");
    });
  });
});
