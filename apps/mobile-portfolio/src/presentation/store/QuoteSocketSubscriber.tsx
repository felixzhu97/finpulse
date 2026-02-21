import { useEffect, useRef } from "react";
import type { QuoteStreamHandle } from "../../infrastructure/services";
import { useAppDispatch, useAppSelector } from "./useAppStore";
import { setSnapshot, setStatus } from "./quotesSlice";
import { selectMergedSubscribedSymbols } from "./quotesSelectors";
import { quoteStreamService } from "../../infrastructure/services";

export function QuoteSocketSubscriber() {
  const dispatch = useAppDispatch();
  const subscribedSymbols = useAppSelector(selectMergedSubscribedSymbols);
  const handleRef = useRef<QuoteStreamHandle | null>(null);
  const service = quoteStreamService;

  useEffect(() => {
    return () => {
      if (handleRef.current) {
        handleRef.current.close();
        handleRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (subscribedSymbols.length === 0) {
      if (handleRef.current) {
        handleRef.current.close();
        handleRef.current = null;
      }
      dispatch(setStatus("idle"));
      return;
    }

    const existing = handleRef.current;
    if (existing) {
      existing.updateSymbols(subscribedSymbols);
      return;
    }

    const handle = service.subscribe({
      symbols: subscribedSymbols,
      onSnapshot: (quotes) => dispatch(setSnapshot(quotes)),
      onStatusChange: (status) => dispatch(setStatus(status)),
    });
    handleRef.current = handle;

    return () => {
      handle.close();
      handleRef.current = null;
    };
  }, [subscribedSymbols.join(","), dispatch, service]);

  return null;
}
