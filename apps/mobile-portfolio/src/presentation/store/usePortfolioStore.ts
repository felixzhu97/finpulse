import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAccountId } from "./portfolioSlice";
import type { RootState } from "./index";

export function usePortfolioStore() {
  const selectedAccountId = useSelector(
    (state: RootState) => state.portfolio.selectedAccountId
  );
  const dispatch = useDispatch();

  return {
    selectedAccountId,
    setSelectedAccountId: useCallback(
      (id: string | null) => dispatch(setSelectedAccountId(id)),
      [dispatch]
    ),
  };
}
