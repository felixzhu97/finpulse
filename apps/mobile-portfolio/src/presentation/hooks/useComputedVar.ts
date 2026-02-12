import { useCallback, useState } from "react";
import type { VarComputeResult } from "../../domain/entities/varCompute";
import { container } from "../../application/services/DependencyContainer";

export interface UseComputedVarResult {
  computedVar: VarComputeResult | null;
  loading: boolean;
  error: boolean;
  compute: () => Promise<void>;
}

export function useComputedVar(): UseComputedVarResult {
  const [computedVar, setComputedVar] = useState<VarComputeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const portfolioRepository = container.getPortfolioRepository();
  const riskMetricsRepository = container.getRiskMetricsRepository();

  const compute = useCallback(async () => {
    setLoading(true);
    setError(false);
    setComputedVar(null);
    try {
      const portfolio = await portfolioRepository.getPortfolio();
      const portfolioId = portfolio?.id;
      if (!portfolioId) {
        setLoading(false);
        return;
      }
      const result = await riskMetricsRepository.computeVar({
        portfolio_id: portfolioId,
        confidence: 0.95,
        method: "historical",
      });
      setComputedVar(result ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [portfolioRepository, riskMetricsRepository]);

  return {
    computedVar,
    loading,
    error,
    compute,
  };
}
