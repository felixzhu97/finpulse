import { useCallback, useMemo, useState } from "react";
import type { VarComputeResult } from "@/src/features/risk/entities/varCompute";
import { container } from "../../features";

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
  const useCase = useMemo(() => container.getRiskMetricsUseCase(), []);

  const compute = useCallback(async () => {
    setLoading(true);
    setError(false);
    setComputedVar(null);
    try {
      const result = await useCase.computeVar();
      setComputedVar(result ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  return {
    computedVar,
    loading,
    error,
    compute,
  };
}
