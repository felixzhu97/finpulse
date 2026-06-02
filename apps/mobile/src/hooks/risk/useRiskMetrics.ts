import {useCallback} from "react";
import {getRiskMetrics} from "@/src/lib";
import {useAsyncLoad} from "@/src/hooks";
import type {RiskMetrics} from "@/src/types";

export interface UseRiskMetricsResult {
    metrics: RiskMetrics | null;
    loading: boolean;
    error: boolean;
    refresh: () => Promise<void>;
}

export function useRiskMetrics(): UseRiskMetricsResult {
    const fetcher = useCallback(() => getRiskMetrics(), []);
    const {data: metrics, loading, error, refresh} = useAsyncLoad<RiskMetrics | null>(fetcher);
    return {metrics, loading, error, refresh};
}