import { useCallback, useState } from "react";

export function useRefreshControl(refresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return { refreshing, onRefresh };
}
