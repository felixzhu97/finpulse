import {useAsyncLoad, useAuth} from "@/src/hooks";
import {useCallback} from "react";
import {getAccountData} from "@/src/lib";
import {useFocusEffect} from "@react-navigation/native";
import type {Account, AccountResource, Customer} from "@/src/types";

export interface UseAccountDataResult {
    customer: Customer | null;
    accounts: Account[];
    accountResources: AccountResource[];
    loading: boolean;
    error: boolean;
    refresh: () => Promise<void>;
}

export function useAccountData(): UseAccountDataResult {
    const {customer: authCustomer} = useAuth();
    const fetcher = useCallback(
        () => getAccountData(authCustomer ?? undefined),
        [authCustomer]
    );
    const {data, loading, error, refresh} = useAsyncLoad(fetcher, null, {
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