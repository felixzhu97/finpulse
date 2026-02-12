import { useCallback, useEffect, useState } from "react";
import type { RiskMetrics } from "@/src/types";
import { portfolioApi, riskMetricsApi } from "@/src/api";

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [portfolio, list] = await Promise.all([
        portfolioApi.getPortfolio(),
        riskMetricsApi.list(),
      ]);
      
      if (list.length === 0) {
        setMetrics(null);
        return;
      }
      
      const portfolioId = portfolio?.id ?? null;
      if (portfolioId) {
        const m = riskMetricsApi.findForPortfolio(list, portfolioId);
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
  }, []);

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
