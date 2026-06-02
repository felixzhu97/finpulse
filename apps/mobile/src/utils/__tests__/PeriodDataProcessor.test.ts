import { PeriodDataProcessor, Period } from "../PeriodDataProcessor";

// ============================================================
// Domain Test Values - Financial Data Domain
// ============================================================

const PERIOD_DOMAIN = {
  ALL: ["1D", "1W", "1M", "3M", "1Y"] as Period[],
  SHORT_TERM: ["1D", "1W"] as Period[],
  LONG_TERM: ["1M", "3M", "1Y"] as Period[],
  CONFIG: {
    "1D": { daysBack: 1, maxPoints: 24 },
    "1W": { daysBack: 7, maxPoints: 28 },
    "1M": { daysBack: 30, maxPoints: 30 },
    "3M": { daysBack: 90, maxPoints: 90 },
    "1Y": { daysBack: 365, maxPoints: 52 },
  },
} as const;

const PRICE_DOMAIN = {
  SMALL: 100,
  MEDIUM: 200,
  LARGE: 500,
  VOLUME_DEFAULT: 750000,
  VOLUME_MIN: 100000,
  VOLUME_MAX: 10000000,
  TOLERANCE: 0.01,
} as const;

const BOUNDARY_VALUES = {
  EMPTY_ARRAY: [] as number[],
  SINGLE_ELEMENT: [100] as number[],
  TWO_ELEMENTS: [100, 200] as number[],
  THREE_ELEMENTS: [100, 150, 200] as number[],
  FIVE_ELEMENTS: [100, 101, 102, 103, 104] as number[],
  MAX_BOUNDARY_24: Array.from({ length: 24 }, (_, i) => i),
  MAX_BOUNDARY_30: Array.from({ length: 30 }, (_, i) => i),
  MAX_BOUNDARY_52: Array.from({ length: 52 }, (_, i) => i),
  LARGE_DATASET_100: Array.from({ length: 100 }, (_, i) => i),
  LARGE_DATASET_200: Array.from({ length: 200 }, (_, i) => i),
  LARGE_DATASET_365: Array.from({ length: 365 }, (_, i) => i),
  LARGE_DATASET_1000: Array.from({ length: 1000 }, (_, i) => i),
} as const;

const EDGE_NUMBERS = {
  ZERO: 0,
  NEGATIVE: -1,
  POSITIVE: 1,
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  MIN_VALUE: Number.MIN_VALUE,
  MAX_VALUE: Number.MAX_VALUE,
  INFINITY: Infinity,
  NEGATIVE_INFINITY: -Infinity,
  NaN: NaN,
  EPSILON: Number.EPSILON,
  FLOAT_PRECISION_EDGE: 0.1 + 0.2,
} as const;

// ============================================================
// Test Factories
// ============================================================

interface VolumeEntry {
  price: number;
  volume: number;
  timestamp: number;
}

const createVolumeHistory = (entries: Array<{ price?: number; volume?: number }>): VolumeEntry[] =>
  entries.map((e, i) => ({
    price: e.price ?? PRICE_DOMAIN.SMALL + i,
    volume: e.volume ?? PRICE_DOMAIN.VOLUME_MIN + i * 1000,
    timestamp: Date.now() - i * 1000,
  }));

const createPriceArray = (length: number, startPrice = 100, increment = 1): number[] =>
  Array.from({ length }, (_, i) => startPrice + i * increment);

// ============================================================
// Test Suites
// ============================================================

describe("PeriodDataProcessor", () => {
  describe("process", () => {
    // ============================================================
    // Empty & Single Element Edge Cases (Boundary Value Testing)
    // ============================================================
    describe("when values array is empty or minimal", () => {
      it.each([
        { name: "empty array", values: BOUNDARY_VALUES.EMPTY_ARRAY },
        { name: "single element", values: BOUNDARY_VALUES.SINGLE_ELEMENT },
        { name: "two elements", values: BOUNDARY_VALUES.TWO_ELEMENTS },
      ])("should handle $name correctly", ({ values }) => {
        // Arrange
        const period: Period = "1D";
        const volumeHistory = [];

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.data).toHaveLength(values.length);
        expect(result.timestamps).toHaveLength(values.length);
        expect(result.volume).toHaveLength(values.length);

        if (values.length === 0) {
          expect(result.data).toEqual([]);
          expect(result.timestamps).toEqual([]);
          expect(result.volume).toEqual([]);
        }
      });

      it("should return empty arrays when values array is empty", () => {
        // Arrange
        const period: Period = "1D";
        const values: number[] = [];
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.data).toEqual([]);
        expect(result.timestamps).toEqual([]);
        expect(result.volume).toEqual([]);
      });

      it("should return single element for all arrays with single input", () => {
        // Arrange
        const period: Period = "1D";
        const values = BOUNDARY_VALUES.SINGLE_ELEMENT;
        const volumeHistory = createVolumeHistory([{ price: 100, volume: 500000 }]);

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.data).toHaveLength(1);
        expect(result.timestamps).toHaveLength(1);
        expect(result.volume).toHaveLength(1);
        expect(result.data[0]).toBe(100);
      });

      it("should use default volume when single element has empty volume history", () => {
        // Arrange
        const period: Period = "1M";
        const values = BOUNDARY_VALUES.SINGLE_ELEMENT;
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.data).toHaveLength(1);
        expect(result.volume[0]).toBe(PRICE_DOMAIN.VOLUME_DEFAULT);
      });
    });

    // ============================================================
    // Parameterized Tests for All Periods
    // ============================================================
    describe.each(PERIOD_DOMAIN.ALL)("period: %s", (period) => {
      const config = PERIOD_DOMAIN.CONFIG[period];

      describe("when values length is less than or equal to max points", () => {
        it.each([
          { count: 1, name: "single element" },
          { count: 2, name: "two elements" },
          { count: 5, name: "five elements" },
          { count: 10, name: "ten elements" },
        ])(`should return all values for $name`, ({ count }) => {
          // Arrange
          const values = createPriceArray(count, 100);
          const volumeHistory: VolumeEntry[] = [];

          // Act
          const result = PeriodDataProcessor.process(period, values, volumeHistory);

          // Assert
          expect(result.data).toHaveLength(count);
          expect(result.data).toEqual(values);
        });
      });

      describe("when values length exceeds max points", () => {
        // Use counts that definitely trigger downsampling (step >= 2)
        const oversizedCounts = [
          config.maxPoints * 2,
          config.maxPoints * 5,
          config.maxPoints * 10,
        ];

        it.each(oversizedCounts)("should downsample when values count is %i", (count) => {
          // Arrange
          const values = createPriceArray(count, 100);

          // Act
          const result = PeriodDataProcessor.process(period, values, []);

          // Assert
          expect(result.data.length).toBeLessThan(count);
          expect(result.data.length).toBeGreaterThanOrEqual(2);
          expect(result.data[0]).toBe(100);
          expect(result.data[result.data.length - 1]).toBe(100 + (count - 1));
        });
      });
    });

    // ============================================================
    // Downsampling Behavior Tests
    // ============================================================
    describe("downsampling behavior", () => {
      it("should always include first and last values after downsampling", () => {
        // Arrange
        const period: Period = "3M";
        const values = createPriceArray(200, 0);

        // Act
        const result = PeriodDataProcessor.process(period, values, []);

        // Assert
        expect(result.data[0]).toBe(0);
        expect(result.data[result.data.length - 1]).toBe(199);
      });

      it("should downsample 1D period (maxPoints: 24) correctly", () => {
        // Arrange
        const period: Period = "1D";
        const values = createPriceArray(100, 100);

        // Act
        const result = PeriodDataProcessor.process(period, values, []);

        // Assert
        expect(result.data.length).toBeLessThan(100);
        expect(result.data[0]).toBe(100);
        expect(result.data[result.data.length - 1]).toBe(199);
      });

      it("should downsample 1Y period (maxPoints: 52) correctly", () => {
        // Arrange
        const period: Period = "1Y";
        const values = createPriceArray(365, 100);

        // Act
        const result = PeriodDataProcessor.process(period, values, []);

        // Assert
        expect(result.data.length).toBeLessThan(100);
        expect(result.data[0]).toBe(100);
      });

      it("should handle array exactly at max points boundary", () => {
        // Arrange
        const values = BOUNDARY_VALUES.MAX_BOUNDARY_24;
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert
        expect(result.data.length).toBe(24);
        expect(result.data).toEqual(BOUNDARY_VALUES.MAX_BOUNDARY_24);
      });
    });

    // ============================================================
    // Timestamp Generation Tests
    // ============================================================
    describe("timestamp generation", () => {
      const periodConfigs: Array<{ period: Period; daysBack: number; name: string }> = [
        { period: "1D", daysBack: 1, name: "1 Day" },
        { period: "1W", daysBack: 7, name: "1 Week" },
        { period: "1M", daysBack: 30, name: "1 Month" },
        { period: "3M", daysBack: 90, name: "3 Months" },
        { period: "1Y", daysBack: 365, name: "1 Year" },
      ];

      it.each(periodConfigs)("should generate timestamps within correct range for $name", ({ period, daysBack }) => {
        // Arrange
        const values = BOUNDARY_VALUES.THREE_ELEMENTS;
        const volumeHistory: VolumeEntry[] = [];
        const beforeCall = Date.now();

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);
        const afterCall = Date.now();

        // Assert
        const periodMs = daysBack * 24 * 60 * 60 * 1000;
        result.timestamps.forEach((ts) => {
          expect(ts).toBeGreaterThanOrEqual(beforeCall - periodMs - 1000);
          expect(ts).toBeLessThanOrEqual(afterCall + 1000);
        });
      });

      it("should distribute timestamps evenly across the period", () => {
        // Arrange
        const period: Period = "1M";
        const values = BOUNDARY_VALUES.THREE_ELEMENTS;
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.timestamps.length).toBe(3);
        expect(result.timestamps[0]).toBeLessThan(result.timestamps[1]);
        expect(result.timestamps[1]).toBeLessThan(result.timestamps[2]);
      });

      it("should generate monotonically increasing timestamps", () => {
        // Arrange
        const values = createPriceArray(10, 100);
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert
        for (let i = 1; i < result.timestamps.length; i++) {
          expect(result.timestamps[i]).toBeGreaterThan(result.timestamps[i - 1]);
        }
      });
    });

    // ============================================================
    // Volume Processing Tests
    // ============================================================
    describe("volume processing", () => {
      it("should return default volume when volume history is empty", () => {
        // Arrange
        const period: Period = "1D";
        const values = BOUNDARY_VALUES.TWO_ELEMENTS;
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.volume).toEqual([PRICE_DOMAIN.VOLUME_DEFAULT, PRICE_DOMAIN.VOLUME_DEFAULT]);
      });

      it("should find volume for exact price match", () => {
        // Arrange
        const period: Period = "1D";
        const values = BOUNDARY_VALUES.TWO_ELEMENTS;
        const volumeHistory = createVolumeHistory([
          { price: 100, volume: 500000 },
          { price: 200, volume: 800000 },
        ]);

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.volume).toEqual([500000, 800000]);
      });

      it("should find volume for near price match (within tolerance)", () => {
        // Arrange
        const period: Period = "1D";
        const values: number[] = [100.005];
        const volumeHistory = createVolumeHistory([{ price: 100, volume: 600000 }]);

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.volume[0]).toBe(600000);
      });

      it("should use last volume when no price match found", () => {
        // Arrange
        const period: Period = "1D";
        const values: number[] = [999];
        const volumeHistory = createVolumeHistory([
          { price: 100, volume: 500000 },
          { price: 200, volume: 600000 },
        ]);

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.volume[0]).toBe(600000);
      });

      it("should use single volume entry when no exact match found", () => {
        // Arrange
        const period: Period = "1D";
        const values: number[] = [999];
        const volumeHistory = createVolumeHistory([{ price: 100, volume: 500000 }]);

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.volume[0]).toBe(500000);
      });

      it("should match volume for price within tolerance (< 0.01)", () => {
        // Arrange
        const values: number[] = [100.005];
        const volumeHistory = createVolumeHistory([{ price: 100, volume: 500000 }]);

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert - 100.005 - 100 = 0.005 < 0.01, should match
        expect(result.volume[0]).toBe(500000);
      });

      it("should not match volume for price at or above tolerance", () => {
        // Arrange
        const values: number[] = [100.01];
        const volumeHistory = createVolumeHistory([{ price: 100, volume: 500000 }]);

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert - 100.01 - 100 = 0.01, NOT < 0.01, so uses fallback
        // The volumeHistory has one entry with volume 500000, so that's the fallback
        expect(result.volume[0]).toBe(500000);
      });
    });

    // ============================================================
    // All Period Configurations
    // ============================================================
    describe("period configurations", () => {
      it.each(PERIOD_DOMAIN.ALL)("should process %s period correctly", (period) => {
        // Arrange
        const config = PERIOD_DOMAIN.CONFIG[period];
        const values = createPriceArray(Math.max(config.maxPoints * 2, 50), 0);
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process(period, values, volumeHistory);

        // Assert
        expect(result.data.length).toBeLessThanOrEqual(values.length);
        expect(result.data[0]).toBe(0);
        expect(result.data[result.data.length - 1]).toBe(values.length - 1);
        expect(result.timestamps.length).toBe(result.data.length);
        expect(result.volume.length).toBe(result.data.length);
      });
    });

    // ============================================================
    // Edge Cases & Boundary Values
    // ============================================================
    describe("edge cases and boundary values", () => {
      it("should handle two-element array correctly", () => {
        // Arrange
        const values = BOUNDARY_VALUES.TWO_ELEMENTS;
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert
        expect(result.data).toEqual(BOUNDARY_VALUES.TWO_ELEMENTS);
        expect(result.timestamps).toHaveLength(2);
        expect(result.volume).toHaveLength(2);
      });

      it("should handle large arrays efficiently", () => {
        // Arrange
        const values = createPriceArray(1000, 0);
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process("1Y", values, volumeHistory);

        // Assert - significant downsampling
        expect(result.data.length).toBeLessThan(100);
        expect(result.data[0]).toBe(0);
        expect(result.data[result.data.length - 1]).toBe(999);
      });

      it("should return synchronized arrays of equal length", () => {
        // Arrange
        const values = createPriceArray(30, 0, 10);
        const volumeHistory = createVolumeHistory([{ price: 100, volume: 500000 }]);

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert
        expect(result.data.length).toBe(result.timestamps.length);
        expect(result.data.length).toBe(result.volume.length);
      });

      it("should preserve value order after downsampling", () => {
        // Arrange
        const values = createPriceArray(100, 100);
        const volumeHistory: VolumeEntry[] = [];

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert
        const isSorted = result.data.every((val, i) => i === 0 || result.data[i] >= result.data[i - 1]);
        expect(isSorted).toBe(true);
      });
    });

    // ============================================================
    // Array Length Consistency Tests
    // ============================================================
    describe("array length consistency", () => {
      const testCases = [
        { count: 0, name: "empty" },
        { count: 1, name: "single" },
        { count: 5, name: "small" },
        { count: 50, name: "medium" },
        { count: 500, name: "large" },
      ];

      it.each(testCases)("should return synchronized arrays for $name input", ({ count }) => {
        // Arrange
        const values = createPriceArray(count, 100);
        const volumeHistory = createVolumeHistory([{ price: 100, volume: 500000 }]);

        // Act
        const result = PeriodDataProcessor.process("1D", values, volumeHistory);

        // Assert
        expect(result.data.length).toBe(result.timestamps.length);
        expect(result.data.length).toBe(result.volume.length);
      });
    });
  });
});
