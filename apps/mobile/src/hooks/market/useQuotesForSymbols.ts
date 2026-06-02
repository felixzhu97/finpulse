import {useAppDispatch} from "@/src/store";
import {useCallback, useEffect} from "react";
import {getQuotes, getQuotesHistoryBatch} from "@/src/lib";
import {setHistory, setSnapshot} from "@/src/store/quotesSlice";

export function useQuotesForSymbols(symbols: string[]) {
    const dispatch = useAppDispatch();

    const refreshQuotes = useCallback(async () => {
        if (symbols.length === 0) return;
        getQuotesHistoryBatch(symbols, 5)
            .then((data) => dispatch(setHistory(data ?? {})))
            .catch(() => dispatch(setHistory({})));
        getQuotes(symbols)
            .then((data) => dispatch(setSnapshot(data ?? {})))
            .catch(() => dispatch(setSnapshot({})));
    }, [symbols.join(","), dispatch]);

    useEffect(() => {
        refreshQuotes();
    }, [refreshQuotes]);

    return {refreshQuotes};
}