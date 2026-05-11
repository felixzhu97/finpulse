import type { VarComputeRequest, VarComputeResult } from "../../../domain/entities/varCompute";

describe("VarCompute Entity", () => {
  describe("VarComputeRequest interface", () => {
    it("should accept valid var compute request with required fields", () => {
      const request: VarComputeRequest = {
        portfolio_id: "PORT001",
      };

      expect(request.portfolio_id).toBe("PORT001");
      expect(request.confidence).toBeUndefined();
      expect(request.method).toBeUndefined();
    });

    it("should accept var compute request with custom confidence", () => {
      const request: VarComputeRequest = {
        portfolio_id: "PORT001",
        confidence: 0.95,
      };

      expect(request.portfolio_id).toBe("PORT001");
      expect(request.confidence).toBe(0.95);
    });

    it("should accept var compute request with custom method", () => {
      const request: VarComputeRequest = {
        portfolio_id: "PORT001",
        method: "historical",
      };

      expect(request.portfolio_id).toBe("PORT001");
      expect(request.method).toBe("historical");
    });

    it("should accept var compute request with all fields", () => {
      const request: VarComputeRequest = {
        portfolio_id: "PORT001",
        confidence: 0.99,
        method: "monte_carlo",
      };

      expect(request.portfolio_id).toBe("PORT001");
      expect(request.confidence).toBe(0.99);
      expect(request.method).toBe("monte_carlo");
    });

    it("should accept various confidence levels", () => {
      const confidenceLevels = [0.9, 0.95, 0.975, 0.99, 0.999];

      confidenceLevels.forEach((confidence) => {
        const request: VarComputeRequest = {
          portfolio_id: "PORT001",
          confidence,
        };

        expect(request.confidence).toBe(confidence);
        expect(request.confidence).toBeGreaterThanOrEqual(0.9);
        expect(request.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should accept various VaR methods", () => {
      const methods = ["historical", "variance_covariance", "monte_carlo", "parametric", " Cornish_Fisher"];

      methods.forEach((method) => {
        const request: VarComputeRequest = {
          portfolio_id: "PORT001",
          method,
        };

        expect(request.method).toBe(method);
      });
    });
  });

  describe("VarComputeResult interface", () => {
    it("should accept valid var compute result with all fields", () => {
      const result: VarComputeResult = {
        var: 5000,
        var_percent: 5.0,
        interpretation: "Value at Risk",
        confidence: 0.95,
        method: "historical",
        mean_return: 0.001,
        volatility: 0.02,
        portfolio_id: "PORT001",
      };

      expect(result.var).toBe(5000);
      expect(result.var_percent).toBe(5.0);
      expect(result.interpretation).toBe("Value at Risk");
      expect(result.confidence).toBe(0.95);
      expect(result.method).toBe("historical");
      expect(result.mean_return).toBe(0.001);
      expect(result.volatility).toBe(0.02);
      expect(result.portfolio_id).toBe("PORT001");
    });

    it("should accept result with only var value", () => {
      const result: VarComputeResult = {
        var: 10000,
      };

      expect(result.var).toBe(10000);
      expect(result.var_percent).toBeUndefined();
    });

    it("should accept result with var_percent only", () => {
      const result: VarComputeResult = {
        var_percent: 2.5,
      };

      expect(result.var_percent).toBe(2.5);
      expect(result.var).toBeUndefined();
    });

    it("should accept result with interpretation", () => {
      const result: VarComputeResult = {
        var: 2500,
        var_percent: 2.5,
        interpretation: "95% confidence: max daily loss is $2,500",
      };

      expect(result.interpretation).toBe("95% confidence: max daily loss is $2,500");
    });

    it("should accept negative var values for conservative estimates", () => {
      const result: VarComputeResult = {
        var: -3000,
        var_percent: -3.0,
      };

      expect(result.var).toBeLessThan(0);
      expect(result.var_percent).toBeLessThan(0);
    });

    it("should accept zero var for risk-free portfolio", () => {
      const result: VarComputeResult = {
        var: 0,
        var_percent: 0,
      };

      expect(result.var).toBe(0);
      expect(result.var_percent).toBe(0);
    });

    it("should handle optional mean_return", () => {
      const result: VarComputeResult = {
        var: 5000,
        mean_return: 0.0005,
      };

      expect(result.mean_return).toBe(0.0005);
    });

    it("should handle optional volatility", () => {
      const result: VarComputeResult = {
        var: 5000,
        volatility: 0.015,
      };

      expect(result.volatility).toBe(0.015);
    });

    it("should accept small volatility values", () => {
      const result: VarComputeResult = {
        var: 1000,
        volatility: 0.001,
      };

      expect(result.volatility).toBeLessThan(0.01);
    });

    it("should accept high volatility values", () => {
      const result: VarComputeResult = {
        var: 15000,
        volatility: 0.05,
      };

      expect(result.volatility).toBe(0.05);
    });
  });

  describe("VaR calculation scenarios", () => {
    it("should model conservative portfolio with low VaR", () => {
      const result: VarComputeResult = {
        var: 1000,
        var_percent: 1.0,
        interpretation: "Conservative portfolio - low risk",
        confidence: 0.95,
        method: "historical",
        mean_return: 0.0002,
        volatility: 0.005,
        portfolio_id: "PORT_CONSERVATIVE",
      };

      expect(result.var).toBeLessThan(5000);
      expect(result.volatility).toBeLessThan(0.01);
    });

    it("should model aggressive portfolio with high VaR", () => {
      const result: VarComputeResult = {
        var: 25000,
        var_percent: 25.0,
        interpretation: "Aggressive portfolio - high risk",
        confidence: 0.95,
        method: "historical",
        mean_return: 0.002,
        volatility: 0.08,
        portfolio_id: "PORT_AGGRESSIVE",
      };

      expect(result.var).toBeGreaterThan(10000);
      expect(result.volatility).toBeGreaterThan(0.05);
    });

    it("should model diversified portfolio with moderate VaR", () => {
      const result: VarComputeResult = {
        var: 8000,
        var_percent: 8.0,
        interpretation: "Diversified portfolio - moderate risk",
        confidence: 0.95,
        method: "variance_covariance",
        mean_return: 0.0008,
        volatility: 0.025,
        portfolio_id: "PORT_DIVERSIFIED",
      };

      expect(result.var_percent).toBeGreaterThan(5);
      expect(result.var_percent).toBeLessThan(15);
    });

    it("should model crypto portfolio with very high VaR", () => {
      const result: VarComputeResult = {
        var: 50000,
        var_percent: 50.0,
        interpretation: "Crypto portfolio - very high risk",
        confidence: 0.99,
        method: "monte_carlo",
        mean_return: 0.005,
        volatility: 0.15,
        portfolio_id: "PORT_CRYPTO",
      };

      expect(result.var_percent).toBeGreaterThan(30);
      expect(result.volatility).toBeGreaterThan(0.1);
    });

    it("should compare portfolios using VaR", () => {
      const portfolios: VarComputeResult[] = [
        {
          var: 1000,
          var_percent: 1.0,
          portfolio_id: "BONDS_ONLY",
        },
        {
          var: 5000,
          var_percent: 5.0,
          portfolio_id: "BALANCED",
        },
        {
          var: 15000,
          var_percent: 15.0,
          portfolio_id: "STOCKS_HEAVY",
        },
      ];

      const sortedByRisk = portfolios.sort((a, b) => (b.var_percent || 0) - (a.var_percent || 0));

      expect(sortedByRisk[0].portfolio_id).toBe("STOCKS_HEAVY");
      expect(sortedByRisk[1].portfolio_id).toBe("BALANCED");
      expect(sortedByRisk[2].portfolio_id).toBe("BONDS_ONLY");
    });
  });
});
