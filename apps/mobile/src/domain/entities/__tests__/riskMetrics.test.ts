import { RiskMetrics } from "../../../domain/entities/riskMetrics";

describe("RiskMetrics Entity", () => {
  describe("RiskMetrics interface", () => {
    it("should accept valid risk metrics data", () => {
      const metrics: RiskMetrics = {
        metric_id: "RM001",
        portfolio_id: "P001",
        as_of_date: "2024-01-15",
        risk_level: "medium",
        volatility: 0.15,
        sharpe_ratio: 1.25,
        var: 0.05,
        beta: 1.1,
      };

      expect(metrics.metric_id).toBe("RM001");
      expect(metrics.portfolio_id).toBe("P001");
      expect(metrics.as_of_date).toBe("2024-01-15");
      expect(metrics.risk_level).toBe("medium");
      expect(metrics.volatility).toBe(0.15);
      expect(metrics.sharpe_ratio).toBe(1.25);
      expect(metrics.var).toBe(0.05);
      expect(metrics.beta).toBe(1.1);
    });

    it("should allow null risk_level", () => {
      const metrics: RiskMetrics = {
        metric_id: "RM002",
        portfolio_id: "P001",
        as_of_date: "2024-01-16",
        risk_level: null,
        volatility: 0.12,
        sharpe_ratio: 1.0,
        var: 0.04,
        beta: 0.95,
      };

      expect(metrics.risk_level).toBeNull();
    });

    it("should allow null volatility", () => {
      const metrics: RiskMetrics = {
        metric_id: "RM003",
        portfolio_id: "P001",
        as_of_date: "2024-01-17",
        risk_level: "low",
        volatility: null,
        sharpe_ratio: 0.8,
        var: 0.02,
        beta: 0.7,
      };

      expect(metrics.volatility).toBeNull();
    });

    it("should allow null sharpe_ratio", () => {
      const metrics: RiskMetrics = {
        metric_id: "RM004",
        portfolio_id: "P002",
        as_of_date: "2024-01-18",
        risk_level: "high",
        volatility: 0.25,
        sharpe_ratio: null,
        var: 0.08,
        beta: 1.4,
      };

      expect(metrics.sharpe_ratio).toBeNull();
    });

    it("should allow null var (Value at Risk)", () => {
      const metrics: RiskMetrics = {
        metric_id: "RM005",
        portfolio_id: "P002",
        as_of_date: "2024-01-19",
        risk_level: "medium",
        volatility: 0.18,
        sharpe_ratio: 1.1,
        var: null,
        beta: 1.05,
      };

      expect(metrics.var).toBeNull();
    });

    it("should allow null beta", () => {
      const metrics: RiskMetrics = {
        metric_id: "RM006",
        portfolio_id: "P003",
        as_of_date: "2024-01-20",
        risk_level: "low",
        volatility: 0.1,
        sharpe_ratio: 1.5,
        var: 0.03,
        beta: null,
      };

      expect(metrics.beta).toBeNull();
    });

    it("should represent low risk portfolio", () => {
      const lowRiskMetrics: RiskMetrics = {
        metric_id: "RM_LOW",
        portfolio_id: "P_LOW",
        as_of_date: "2024-01-21",
        risk_level: "low",
        volatility: 0.08,
        sharpe_ratio: 1.8,
        var: 0.02,
        beta: 0.6,
      };

      expect(lowRiskMetrics.risk_level).toBe("low");
      expect(lowRiskMetrics.volatility).toBeLessThan(0.15);
      expect(lowRiskMetrics.beta).toBeLessThan(1);
    });

    it("should represent high risk portfolio", () => {
      const highRiskMetrics: RiskMetrics = {
        metric_id: "RM_HIGH",
        portfolio_id: "P_HIGH",
        as_of_date: "2024-01-22",
        risk_level: "high",
        volatility: 0.35,
        sharpe_ratio: 0.5,
        var: 0.12,
        beta: 1.8,
      };

      expect(highRiskMetrics.risk_level).toBe("high");
      expect(highRiskMetrics.volatility).toBeGreaterThan(0.25);
      expect(highRiskMetrics.beta).toBeGreaterThan(1.5);
    });

    it("should handle various risk levels", () => {
      const riskLevels = ["low", "medium", "high", "very_high", "moderate"];

      riskLevels.forEach((level) => {
        const metrics: RiskMetrics = {
          metric_id: `RM_${level}`,
          portfolio_id: "P_TEST",
          as_of_date: "2024-01-23",
          risk_level: level,
          volatility: 0.15,
          sharpe_ratio: 1.0,
          var: 0.05,
          beta: 1.0,
        };

        expect(metrics.risk_level).toBe(level);
      });
    });
  });
});
