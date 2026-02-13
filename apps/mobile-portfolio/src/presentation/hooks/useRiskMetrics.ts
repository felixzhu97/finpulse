import { useCallback } from "react";
import type { RiskMetrics } from "@/src/core/domain/entities/riskMetrics";
import { container } from "../../core/application";
import { useAsyncLoad } from "./useAsyncLoad";

export interface UseRiskMetricsResult {
  metrics: RiskMetrics | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useRiskMetrics(): UseRiskMetricsResult {
  const fetcher = useCallback(() => container.getRiskMetricsUseCase().get(), []);
  const { data: metrics, loading, error, refresh } = useAsyncLoad<RiskMetrics | null>(fetcher);
  return { metrics, loading, error, refresh };
}
