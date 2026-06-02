import type { VarComputeRequest, VarComputeResult } from "@/src/types/varCompute";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const VAR_DOMAIN = {
  CONFIDENCE_LEVELS: [0.9, 0.95, 0.975, 0.99, 0.999] as const,
  METHODS: ["historical", "variance_covariance", "monte_carlo", "parametric", "Cornish_Fisher"] as const,
  IDS: {
    PREFIX: "PORT",
    TEST: "PORT001",
  } as const,
  METRICS: {
    VAR_AMOUNTS: {
      LOW: 1000,
      MEDIUM: 5000,
      HIGH: 15000,
      CRYPTO: 50000,
    },
    VAR_PERCENTS: {
      CONSERVATIVE: 1.0,
      LOW: 2.5,
      MEDIUM: 5.0,
      HIGH: 15.0,
      VERY_HIGH: 50.0,
    },
    VOLATILITY: {
      LOW: 0.005,
      MEDIUM: 0.02,
      HIGH: 0.05,
      EXTREME: 0.15,
    },
    MEAN_RETURN: {
      LOW: 0.0002,
      MEDIUM: 0.0008,
      HIGH: 0.002,
      VERY_HIGH: 0.005,
    },
  } as const,
} as const;

const PORTFOLIO_SCENARIOS = {
  CONSERVATIVE: {
    id: "PORT_CONSERVATIVE",
    var: VAR_DOMAIN.METRICS.VAR_AMOUNTS.LOW,
    varPercent: VAR_DOMAIN.METRICS.VAR_PERCENTS.CONSERVATIVE,
    volatility: VAR_DOMAIN.METRICS.VOLATILITY.LOW,
    confidence: 0.95,
    method: "historical",
    interpretation: "Conservative portfolio - low risk",
  },
  BALANCED: {
    id: "PORT_BALANCED",
    var: VAR_DOMAIN.METRICS.VAR_AMOUNTS.MEDIUM,
    varPercent: VAR_DOMAIN.METRICS.VAR_PERCENTS.MEDIUM,
    volatility: VAR_DOMAIN.METRICS.VOLATILITY.MEDIUM,
    confidence: 0.95,
    method: "variance_covariance",
    interpretation: "Balanced portfolio - moderate risk",
  },
  AGGRESSIVE: {
    id: "PORT_AGGRESSIVE",
    var: VAR_DOMAIN.METRICS.VAR_AMOUNTS.HIGH,
    varPercent: VAR_DOMAIN.METRICS.VAR_PERCENTS.HIGH,
    volatility: VAR_DOMAIN.METRICS.VOLATILITY.HIGH,
    confidence: 0.95,
    method: "historical",
    interpretation: "Aggressive portfolio - high risk",
  },
  CRYPTO: {
    id: "PORT_CRYPTO",
    var: VAR_DOMAIN.METRICS.VAR_AMOUNTS.CRYPTO,
    varPercent: VAR_DOMAIN.METRICS.VAR_PERCENTS.VERY_HIGH,
    volatility: VAR_DOMAIN.METRICS.VOLATILITY.EXTREME,
    confidence: 0.99,
    method: "monte_carlo",
    interpretation: "Crypto portfolio - very high risk",
  },
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createVarComputeRequest = (
  overrides: Partial<VarComputeRequest> = {}
): VarComputeRequest => ({
  portfolio_id: VAR_DOMAIN.IDS.TEST,
  ...overrides,
});

const createVarComputeResult = (
  overrides: Partial<VarComputeResult> = {}
): VarComputeResult => ({
  var: VAR_DOMAIN.METRICS.VAR_AMOUNTS.MEDIUM,
  var_percent: VAR_DOMAIN.METRICS.VAR_PERCENTS.MEDIUM,
  interpretation: "Value at Risk",
  confidence: 0.95,
  method: "historical",
  mean_return: 0.001,
  volatility: VAR_DOMAIN.METRICS.VOLATILITY.MEDIUM,
  portfolio_id: VAR_DOMAIN.IDS.TEST,
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("VarCompute Entity", () => {
  describe("VarComputeRequest interface", () => {
    describe("when providing valid data", () => {
      it("should accept minimal request with only portfolio_id", () => {
        // Arrange
        const request = createVarComputeRequest();

        // Assert
        expect(request.portfolio_id).toBe(VAR_DOMAIN.IDS.TEST);
        expect(request.confidence).toBeUndefined();
        expect(request.method).toBeUndefined();
      });

      it.each([
        { confidence: 0.9, desc: "90% confidence" },
        { confidence: 0.95, desc: "95% confidence" },
        { confidence: 0.99, desc: "99% confidence" },
        { confidence: 0.999, desc: "99.9% confidence" },
      ])("should accept $desc", ({ confidence }) => {
        const request = createVarComputeRequest({ confidence });
        expect(request.confidence).toBe(confidence);
        expect(request.confidence).toBeGreaterThanOrEqual(0.9);
        expect(request.confidence).toBeLessThanOrEqual(1);
      });
    });

    describe("when validating VaR methods", () => {
      it.each(VAR_DOMAIN.METHODS)("should accept method: %s", (method) => {
        const request = createVarComputeRequest({ method });
        expect(request.method).toBe(method);
      });
    });

    describe("when providing complete request", () => {
      it("should accept request with all optional fields", () => {
        const request = createVarComputeRequest({
          confidence: 0.99,
          method: "monte_carlo",
        });

        expect(request.portfolio_id).toBe(VAR_DOMAIN.IDS.TEST);
        expect(request.confidence).toBe(0.99);
        expect(request.method).toBe("monte_carlo");
      });
    });
  });

  describe("VarComputeResult interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete VaR result", () => {
        // Arrange
        const result = createVarComputeResult();

        // Assert
        expect(result.var).toBe(VAR_DOMAIN.METRICS.VAR_AMOUNTS.MEDIUM);
        expect(result.var_percent).toBe(VAR_DOMAIN.METRICS.VAR_PERCENTS.MEDIUM);
        expect(result.confidence).toBe(0.95);
        expect(result.method).toBe("historical");
      });
    });

    describe("when handling optional fields", () => {
      it.each([
        { field: "var", value: 10000, desc: "with var value" },
        { field: "var_percent", value: 2.5, desc: "with var_percent only" },
        { field: "interpretation", value: "95% confidence: max daily loss", desc: "with interpretation" },
        { field: "mean_return", value: 0.0005, desc: "with mean_return" },
        { field: "volatility", value: 0.015, desc: "with volatility" },
      ])("should accept $desc", ({ field, value }) => {
        const result = createVarComputeResult({ [field]: value });
        expect(result[field]).toBe(value);
      });
    });

    describe("when handling boundary values", () => {
      it.each([
        { varValue: 0, varPercentValue: 0, desc: "zero VaR for risk-free portfolio" },
        { varValue: -3000, varPercentValue: -3.0, desc: "negative VaR for conservative estimates" },
        { varValue: 1000, varPercentValue: 1.0, desc: "very low VaR" },
      ])("should handle $desc", ({ varValue, varPercentValue }) => {
        const result = createVarComputeResult({ var: varValue, var_percent: varPercentValue });
        expect(result.var).toBe(varValue);
        expect(result.var_percent).toBe(varPercentValue);
      });
    });

    describe("when validating volatility ranges", () => {
      it.each([
        { volatility: 0.001, desc: "very low volatility", expected: "< 0.01" },
        { volatility: 0.015, desc: "medium volatility" },
        { volatility: 0.05, desc: "high volatility" },
      ])("should accept $desc", ({ volatility }) => {
        const result = createVarComputeResult({ volatility });
        expect(result.volatility).toBe(volatility);
      });
    });
  });

  describe("VaR calculation scenarios", () => {
    it.each([
      { scenario: PORTFOLIO_SCENARIOS.CONSERVATIVE, expected: { varMax: 5000, volMax: 0.01 } },
      { scenario: PORTFOLIO_SCENARIOS.BALANCED, expected: { varRange: [4000, 6000], volRange: [0.015, 0.03] } },
      { scenario: PORTFOLIO_SCENARIOS.AGGRESSIVE, expected: { varMin: 10000, volMin: 0.05 } },
      { scenario: PORTFOLIO_SCENARIOS.CRYPTO, expected: { varMin: 30000, volMin: 0.1 } },
    ])("should model $scenario.interpretation", ({ scenario }) => {
      const result = createVarComputeResult({
        var: scenario.var,
        var_percent: scenario.varPercent,
        volatility: scenario.volatility,
        confidence: scenario.confidence,
        method: scenario.method,
        portfolio_id: scenario.id,
        interpretation: scenario.interpretation,
      });

      expect(result.portfolio_id).toBe(scenario.id);
      expect(result.var).toBe(scenario.var);
      expect(result.volatility).toBe(scenario.volatility);
    });

    it("should rank portfolios by risk level", () => {
      const portfolios: VarComputeResult[] = [
        { var: 1000, var_percent: 1.0, portfolio_id: "BONDS_ONLY" },
        { var: 5000, var_percent: 5.0, portfolio_id: "BALANCED" },
        { var: 15000, var_percent: 15.0, portfolio_id: "STOCKS_HEAVY" },
      ];

      const sortedByRisk = portfolios.sort(
        (a, b) => (b.var_percent || 0) - (a.var_percent || 0)
      );

      expect(sortedByRisk[0].portfolio_id).toBe("STOCKS_HEAVY");
      expect(sortedByRisk[1].portfolio_id).toBe("BALANCED");
      expect(sortedByRisk[2].portfolio_id).toBe("BONDS_ONLY");
    });
  });
});
