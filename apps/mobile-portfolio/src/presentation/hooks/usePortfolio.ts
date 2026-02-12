import { useCallback, useEffect, useState } from "react";
import type {
  AssetAllocationItem,
  Portfolio,
  PortfolioHistoryPoint,
} from "../../domain/entities/portfolio";
import { container } from "../../application/services/DependencyContainer";

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
      const useCase = container.getPortfolioUseCase();
      const result = await useCase.execute();
      setPortfolio(result.portfolio);
      setAllocation(result.allocation);
      setHistory(result.history);
      if (result.portfolio === null) setError(true);
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
    const useCase = container.getPortfolioUseCase();
    await useCase.refresh();
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
