import { useCallback, useEffect, useState } from "react";

export interface UseAsyncLoadOptions<T> {
  initialData?: T | null;
  refreshFetcher?: () => Promise<T>;
}

export interface UseAsyncLoadResult<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useAsyncLoad<T>(
  fetcher: () => Promise<T>,
  initialData: T | null = null,
  options?: Pick<UseAsyncLoadOptions<T>, "refreshFetcher"> & { skipInitialLoad?: boolean }
): UseAsyncLoadResult<T> {
  const refreshFetcher = options?.refreshFetcher;
  const skipInitialLoad = options?.skipInitialLoad ?? false;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(!skipInitialLoad);
  const [error, setError] = useState(false);

  const runLoad = useCallback(async (fn: () => Promise<T>) => {
    setLoading(true);
    setError(false);
    try {
      setData(await fn());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const load = useCallback(() => runLoad(fetcher), [runLoad, fetcher]);
  const refresh = useCallback(
    () => runLoad(refreshFetcher ?? fetcher),
    [runLoad, fetcher, refreshFetcher]
  );

  useEffect(() => {
    if (!skipInitialLoad) load();
  }, [load, skipInitialLoad]);

  return { data, loading, error, refresh };
}
