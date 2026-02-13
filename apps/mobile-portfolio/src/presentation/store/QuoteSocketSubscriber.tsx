import { useEffect, useMemo, useRef } from "react";
import type { QuoteStreamHandle } from "../../domain/services/IQuoteStreamService";
import { useAppDispatch, useAppSelector } from "./useAppStore";
import { setSnapshot, setStatus } from "./quotesSlice";
import { selectSubscribedSymbols } from "./quotesSelectors";
import { container } from "../../application";

export function QuoteSocketSubscriber() {
  const dispatch = useAppDispatch();
  const subscribedSymbols = useAppSelector(selectSubscribedSymbols);
  const handleRef = useRef<QuoteStreamHandle | null>(null);
  const service = useMemo(() => container.getQuoteStreamService(), []);

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
