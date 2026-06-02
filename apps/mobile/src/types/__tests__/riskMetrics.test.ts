import { RiskMetrics } from "@/src/types/riskMetrics";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const RISK_DOMAIN = {
  LEVELS: ["low", "medium", "high", "very_high", "moderate"] as const,
  IDS: {
    PREFIX: "RM",
    PORT_PREFIX: "P",
    TEST: "RM001",
    PORTFOLIO: "P001",
  } as const,
  DATES: {
    NOW: "2024-01-15",
    PAST: "2024-01-01",
    FUTURE: "2024-12-31",
  } as const,
  METRICS: {
    VOLATILITY: {
      LOW: 0.08,
      MEDIUM: 0.15,
      HIGH: 0.25,
      VERY_HIGH: 0.35,
    },
    SHARPE_RATIO: {
      LOW: 0.5,
      MEDIUM: 1.0,
      HIGH: 1.5,
      VERY_HIGH: 1.8,
    },
    VAR: {
      LOW: 0.02,
      MEDIUM: 0.05,
      HIGH: 0.08,
      VERY_HIGH: 0.12,
    },
    BETA: {
      LOW: 0.6,
      MEDIUM: 1.0,
      HIGH: 1.4,
      VERY_HIGH: 1.8,
    },
  } as const,
} as const;

const PORTFOLIO_SCENARIOS = {
  LOW_RISK: {
    id: "RM_LOW",
    portfolioId: "P_LOW",
    riskLevel: "low" as const,
    volatility: RISK_DOMAIN.METRICS.VOLATILITY.LOW,
    sharpeRatio: RISK_DOMAIN.METRICS.SHARPE_RATIO.VERY_HIGH,
    var: RISK_DOMAIN.METRICS.VAR.LOW,
    beta: RISK_DOMAIN.METRICS.BETA.LOW,
  },
  MEDIUM_RISK: {
    id: "RM_MEDIUM",
    portfolioId: "P_MEDIUM",
    riskLevel: "medium" as const,
    volatility: RISK_DOMAIN.METRICS.VOLATILITY.MEDIUM,
    sharpeRatio: RISK_DOMAIN.METRICS.SHARPE_RATIO.MEDIUM,
    var: RISK_DOMAIN.METRICS.VAR.MEDIUM,
    beta: RISK_DOMAIN.METRICS.BETA.MEDIUM,
  },
  HIGH_RISK: {
    id: "RM_HIGH",
    portfolioId: "P_HIGH",
    riskLevel: "high" as const,
    volatility: RISK_DOMAIN.METRICS.VOLATILITY.HIGH,
    sharpeRatio: RISK_DOMAIN.METRICS.SHARPE_RATIO.LOW,
    var: RISK_DOMAIN.METRICS.VAR.HIGH,
    beta: RISK_DOMAIN.METRICS.BETA.HIGH,
  },
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createRiskMetrics = (overrides: Partial<RiskMetrics> = {}): RiskMetrics => ({
  metric_id: RISK_DOMAIN.IDS.TEST,
  portfolio_id: RISK_DOMAIN.IDS.PORTFOLIO,
  as_of_date: RISK_DOMAIN.DATES.NOW,
  risk_level: "medium",
  volatility: RISK_DOMAIN.METRICS.VOLATILITY.MEDIUM,
  sharpe_ratio: RISK_DOMAIN.METRICS.SHARPE_RATIO.MEDIUM,
  var: RISK_DOMAIN.METRICS.VAR.MEDIUM,
  beta: RISK_DOMAIN.METRICS.BETA.MEDIUM,
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("RiskMetrics Entity", () => {
  describe("RiskMetrics interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete risk metrics", () => {
        // Arrange
        const metrics = createRiskMetrics();

        // Assert
        expect(metrics.metric_id).toBe(RISK_DOMAIN.IDS.TEST);
        expect(metrics.portfolio_id).toBe(RISK_DOMAIN.IDS.PORTFOLIO);
        expect(metrics.as_of_date).toBe(RISK_DOMAIN.DATES.NOW);
        expect(metrics.risk_level).toBe("medium");
        expect(metrics.volatility).toBe(RISK_DOMAIN.METRICS.VOLATILITY.MEDIUM);
        expect(metrics.sharpe_ratio).toBe(RISK_DOMAIN.METRICS.SHARPE_RATIO.MEDIUM);
        expect(metrics.var).toBe(RISK_DOMAIN.METRICS.VAR.MEDIUM);
        expect(metrics.beta).toBe(RISK_DOMAIN.METRICS.BETA.MEDIUM);
      });
    });

    describe("when validating risk levels", () => {
      it.each(RISK_DOMAIN.LEVELS)("should accept level: %s", (level) => {
        const metrics = createRiskMetrics({ risk_level: level });
        expect(metrics.risk_level).toBe(level);
      });
    });

    describe("when handling nullable metric fields", () => {
      it.each([
        { field: "risk_level", value: null, desc: "null risk_level" },
        { field: "volatility", value: null, desc: "null volatility" },
        { field: "sharpe_ratio", value: null, desc: "null sharpe_ratio" },
        { field: "var", value: null, desc: "null VaR" },
        { field: "beta", value: null, desc: "null beta" },
      ])("should accept $desc", ({ field, value }) => {
        const metrics = createRiskMetrics({ [field]: value });
        expect(metrics[field]).toBe(value);
      });
    });

    describe("when validating metric ranges", () => {
      it.each([
        { field: "volatility", value: 0.08, desc: "low volatility" },
        { field: "volatility", value: 0.35, desc: "very high volatility" },
        { field: "sharpe_ratio", value: 0.5, desc: "low Sharpe ratio" },
        { field: "sharpe_ratio", value: 1.8, desc: "high Sharpe ratio" },
        { field: "var", value: 0.02, desc: "low VaR" },
        { field: "var", value: 0.12, desc: "high VaR" },
        { field: "beta", value: 0.6, desc: "low beta" },
        { field: "beta", value: 1.8, desc: "high beta" },
      ])("should accept $desc", ({ field, value }) => {
        const metrics = createRiskMetrics({ [field]: value });
        expect(metrics[field]).toBe(value);
      });
    });

    describe("when modeling portfolio scenarios", () => {
      it.each([
        { scenario: PORTFOLIO_SCENARIOS.LOW_RISK, assertions: { volMax: 0.15, betaMax: 1.0 } },
        { scenario: PORTFOLIO_SCENARIOS.HIGH_RISK, assertions: { volMin: 0.25, betaMin: 1.5 } },
      ])("should model $scenario.id portfolio", ({ scenario }) => {
        const metrics = createRiskMetrics({
          metric_id: scenario.id,
          portfolio_id: scenario.portfolioId,
          risk_level: scenario.riskLevel,
          volatility: scenario.volatility,
          sharpe_ratio: scenario.sharpeRatio,
          var: scenario.var,
          beta: scenario.beta,
        });

        expect(metrics.risk_level).toBe(scenario.riskLevel);
        expect(metrics.volatility).toBe(scenario.volatility);
        expect(metrics.beta).toBe(scenario.beta);
      });
    });

    describe("when handling timestamps", () => {
      it("should accept date format", () => {
        const metrics = createRiskMetrics({
          as_of_date: RISK_DOMAIN.DATES.NOW,
        });
        expect(metrics.as_of_date).toBe(RISK_DOMAIN.DATES.NOW);
      });

      it("should accept various date values", () => {
        const dates = [RISK_DOMAIN.DATES.PAST, RISK_DOMAIN.DATES.NOW, RISK_DOMAIN.DATES.FUTURE];
        dates.forEach((date) => {
          const metrics = createRiskMetrics({ as_of_date: date });
          expect(metrics.as_of_date).toBe(date);
        });
      });
    });
  });
});
