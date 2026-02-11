import { useCallback, useState } from "react";
import type { VarComputeResult } from "../types";
import { portfolioApi, riskMetricsApi } from "../api";

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

  const compute = useCallback(async () => {
    setLoading(true);
    setError(false);
    setComputedVar(null);
    try {
      const portfolio = await portfolioApi.getPortfolio();
      const portfolioId = portfolio?.id;
      if (!portfolioId) {
        setLoading(false);
        return;
      }
      const result = await riskMetricsApi.computeVar({
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
  }, []);

  return {
    computedVar,
    loading,
    error,
    compute,
  };
}
