import { useCallback } from "react";
import type { RiskSummary } from "@/src/core/domain/entities/portfolio";
import { container } from "../../core/application";
import { useAsyncLoad } from "./useAsyncLoad";

export interface UseRiskSummaryResult {
  summary: RiskSummary | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useRiskSummary(): UseRiskSummaryResult {
  const fetcher = useCallback(
    () => container.getRiskMetricsUseCase().getRiskSummary(),
    []
  );
  const {
    data: summary,
    loading,
    error,
    refresh,
  } = useAsyncLoad<RiskSummary | null>(fetcher);
  return { summary, loading, error, refresh };
}

