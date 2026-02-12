import { useEffect, useState } from "react";
import { portfolioStore } from "./PortfolioStore";

export function usePortfolioStore() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    portfolioStore.getSelectedAccountId()
  );

  useEffect(() => {
    const unsubscribe = portfolioStore.subscribe(setSelectedAccountId);
    return unsubscribe;
  }, []);

  return {
    selectedAccountId,
    setSelectedAccountId: (id: string | null) => {
      portfolioStore.setSelectedAccountId(id);
    },
  };
}
