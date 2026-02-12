import { useCallback, useEffect, useState } from "react";
import type { RiskMetrics } from "../../domain/entities/riskMetrics";
import { container } from "../../application/services/DependencyContainer";

export interface UseRiskMetricsResult {
  metrics: RiskMetrics | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useRiskMetrics(): UseRiskMetricsResult {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const portfolioRepository = container.getPortfolioRepository();
  const riskMetricsRepository = container.getRiskMetricsRepository();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [portfolio, list] = await Promise.all([
        portfolioRepository.getPortfolio(),
        riskMetricsRepository.list(),
      ]);
      
      if (list.length === 0) {
        setMetrics(null);
        return;
      }
      
      const portfolioId = portfolio?.id ?? null;
      if (portfolioId) {
        const m = riskMetricsRepository.findForPortfolio(list, portfolioId);
        if (m) {
          setMetrics(m);
          return;
        }
      }
      
      setMetrics(list[0]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [portfolioRepository, riskMetricsRepository]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return {
    metrics,
    loading,
    error,
    refresh,
  };
}
