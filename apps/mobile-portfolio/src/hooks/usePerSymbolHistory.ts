import { useCallback, useEffect, useRef, useState } from "react";

const MAX_POINTS = 45;

export function usePerSymbolHistory(
  symbols: string[],
  quotes: Record<string, { price: number }>,
  initialPrices: Record<string, number>
): Record<string, number[]> {
  const historyRef = useRef<Record<string, number[]>>({});
  const [history, setHistory] = useState<Record<string, number[]>>({});

  const update = useCallback(() => {
    const h = historyRef.current;
    const next: Record<string, number[]> = {};
    for (const sym of Object.keys(h)) {
      next[sym] = [...h[sym]];
    }
    setHistory(next);
  }, []);

  useEffect(() => {
    const h = historyRef.current;
    let changed = false;

    for (const symbol of symbols) {
      const key = symbol.toUpperCase();
      const price = quotes[key]?.price ?? initialPrices[key];
      if (price == null) continue;

      let arr = h[key];
      if (!arr) {
        arr = [price];
        h[key] = arr;
        changed = true;
      } else {
        const last = arr[arr.length - 1];
        if (last !== price) {
          arr.push(price);
          if (arr.length > MAX_POINTS) arr.shift();
          changed = true;
        }
      }
    }

    if (changed) update();
  }, [symbols, quotes, initialPrices, update]);

  return history;
}
