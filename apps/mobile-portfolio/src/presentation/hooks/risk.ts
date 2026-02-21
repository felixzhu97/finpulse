import { useState, useCallback } from "react";
import type { RiskMetrics } from "../../domain/entities/riskMetrics";
import type { RiskSummary } from "../../domain/entities/portfolio";
import type { VarComputeResult } from "../../domain/entities/varCompute";
import {
  getRiskMetrics,
  getRiskSummary,
  computeVar,
} from "../../infrastructure/api";
import { useAsyncLoad } from "./common";

export interface UseRiskMetricsResult {
  metrics: RiskMetrics | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useRiskMetrics(): UseRiskMetricsResult {
  const fetcher = useCallback(() => getRiskMetrics(), []);
  const { data: metrics, loading, error, refresh } = useAsyncLoad<RiskMetrics | null>(fetcher);
  return { metrics, loading, error, refresh };
}

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
      const result = await computeVar();
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

export interface UseRiskSummaryResult {
  summary: RiskSummary | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useRiskSummary(): UseRiskSummaryResult {
  const fetcher = useCallback(() => getRiskSummary(), []);
  const {
    data: summary,
    loading,
    error,
    refresh,
  } = useAsyncLoad<RiskSummary | null>(fetcher);
  return { summary, loading, error, refresh };
}
