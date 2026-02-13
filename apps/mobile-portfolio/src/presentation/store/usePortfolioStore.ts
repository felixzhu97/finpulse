import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./useAppStore";
import { setSelectedAccountId } from "./portfolioSlice";

export function usePortfolioStore() {
  const selectedAccountId = useAppSelector((s) => s.portfolio.selectedAccountId);
  const dispatch = useAppDispatch();

  return {
    selectedAccountId,
    setSelectedAccountId: useCallback(
      (id: string | null) => dispatch(setSelectedAccountId(id)),
      [dispatch]
    ),
  };
}
