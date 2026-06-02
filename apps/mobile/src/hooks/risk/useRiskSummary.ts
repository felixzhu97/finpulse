import type {RiskSummary} from "@/src/types";
import {useCallback} from "react";
import {getRiskSummary} from "@/src/lib";
import {useAsyncLoad} from "@/src/hooks";

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
    return {summary, loading, error, refresh};
}