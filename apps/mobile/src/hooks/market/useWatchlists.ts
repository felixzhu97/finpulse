import type {Instrument, Watchlist} from "@/src/types";
import {useAnalytics} from "../../../../../packages/analytics/src/react";
import {useCallback} from "react";
import {
    addWatchlistItem as apiAddWatchlistItem,
    createWatchlist as apiCreateWatchlist,
    getWatchlists,
    removeWatchlistItem as apiRemoveWatchlistItem
} from "@/src/lib";
import {useAsyncLoad} from "@/src/hooks";
import {WATCHLIST_ADD, WATCHLIST_CREATE, WATCHLIST_REMOVE} from "../../../../../packages/analytics";
import { WatchlistWithItems } from "@/src/types/dto";

const EMPTY: { watchlists: WatchlistWithItems[]; instruments: Instrument[] } = {
    watchlists: [],
    instruments: [],
};

export interface UseWatchlistsResult {
    watchlists: WatchlistWithItems[];
    instruments: Instrument[];
    loading: boolean;
    error: boolean;
    refresh: () => Promise<void>;
    addItem: (watchlistId: string, instrumentId: string) => Promise<boolean>;
    removeItem: (watchlistItemId: string) => Promise<boolean>;
    createWatchlist: (name: string) => Promise<Watchlist | null>;
}

export function useWatchlists(): UseWatchlistsResult {
    const analytics = useAnalytics();
    const fetcher = useCallback(() => getWatchlists(), []);
    const {data, loading, error, refresh} = useAsyncLoad(fetcher, EMPTY);

    const watchlists = data?.watchlists ?? [];
    const instruments = data?.instruments ?? [];

    const addItem = useCallback(
        async (watchlistId: string, instrumentId: string) => {
            const item = await apiAddWatchlistItem(watchlistId, instrumentId);
            analytics.track(WATCHLIST_ADD, {success: !!item});
            if (item) {
                await refresh();
                return true;
            }
            return false;
        },
        [analytics, refresh]
    );

    const removeItem = useCallback(
        async (watchlistItemId: string) => {
            const ok = await apiRemoveWatchlistItem(watchlistItemId);
            analytics.track(WATCHLIST_REMOVE, {success: ok});
            if (ok) await refresh();
            return ok;
        },
        [analytics, refresh]
    );

    const createWatchlist = useCallback(
        async (name: string) => {
            const created = await apiCreateWatchlist(name);
            analytics.track(WATCHLIST_CREATE, {success: !!created});
            if (created) await refresh();
            return created;
        },
        [analytics, refresh]
    );

    return {
        watchlists,
        instruments,
        loading,
        error,
        refresh,
        addItem,
        removeItem,
        createWatchlist,
    };
}