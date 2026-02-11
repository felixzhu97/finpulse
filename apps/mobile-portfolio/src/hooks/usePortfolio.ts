import { useCallback, useEffect, useState } from "react";
import type {
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
} from "@/src/types";
import { portfolioApi } from "@/src/api";

export interface UsePortfolioResult {
  portfolio: Portfolio | null;
  allocation: AssetAllocationItem[];
  history: PortfolioHistoryPoint[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [allocation, setAllocation] = useState<AssetAllocationItem[]>([]);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [p, a, h] = await Promise.all([
        portfolioApi.getPortfolio(),
        portfolioApi.getAssetAllocationByAccountType(),
        portfolioApi.getPortfolioHistory(),
      ]);
      setPortfolio(p ?? null);
      setAllocation(a);
      setHistory(h ?? []);
      if (p === null) setError(true);
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
    portfolioApi.invalidateCache();
    await load();
  }, [load]);

  return {
    portfolio,
    allocation,
    history,
    loading,
    error,
    refresh,
  };
}
