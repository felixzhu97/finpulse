import type {AssetAllocationItem, Portfolio, PortfolioHistoryPoint} from "@/src/types";
import {useCallback} from "react";
import {getPortfolioData} from "@/src/lib";
import {useAsyncLoad} from "@/src/hooks";

export interface UsePortfolioResult {
    portfolio: Portfolio | null;
    allocation: AssetAllocationItem[];
    history: PortfolioHistoryPoint[];
    loading: boolean;
    error: boolean;
    refresh: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioResult {
    const fetcher = useCallback(() => getPortfolioData(false), []);
    const refreshFetcher = useCallback(() => getPortfolioData(true), []);
    const {data, loading, error, refresh} = useAsyncLoad(fetcher, null, {
        refreshFetcher,
    });

    const portfolio = data?.portfolio ?? null;
    const allocation = data?.allocation ?? [];
    const history = data?.history ?? [];
    const hasError = error || (data != null && portfolio === null);

    return {
        portfolio,
        allocation,
        history,
        loading,
        error: hasError,
        refresh,
    };
}