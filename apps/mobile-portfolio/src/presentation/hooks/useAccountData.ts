import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import type { Account } from "@/src/core/domain/entities/portfolio";
import type { AccountResource } from "@/src/core/domain/entities/accountResource";
import type { Customer } from "@/src/core/domain/entities/customer";
import { container } from "../../core/application";
import { useAsyncLoad } from "./useAsyncLoad";

export interface UseAccountDataResult {
  customer: Customer | null;
  accounts: Account[];
  accountResources: AccountResource[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useAccountData(): UseAccountDataResult {
  const fetcher = useCallback(() => container.getAccountDataUseCase().execute(), []);
  const { data, loading, error, refresh } = useAsyncLoad(fetcher, null, {
    skipInitialLoad: true,
  });

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return {
    customer: data?.customer ?? null,
    accounts: data?.accounts ?? [],
    accountResources: data?.accountResources ?? [],
    loading,
    error,
    refresh,
  };
}
