import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserPreference } from "../../domain/entities/userPreference";
import { container } from "../../application";

export interface UseUserPreferencesResult {
  preference: UserPreference | null;
  customerId: string | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
  updatePreference: (
    theme: string | null,
    language: string | null,
    notificationsEnabled: boolean
  ) => Promise<boolean>;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const [preference, setPreference] = useState<UserPreference | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const minLoadingMs = 400;
  const maxLoadingMs = 10000;
  const useCase = useMemo(() => container.getUserPreferenceUseCase(), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const start = Date.now();
    const forceDoneTimer = setTimeout(() => setLoading(false), maxLoadingMs);
    const scheduleDone = () => {
      clearTimeout(forceDoneTimer);
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minLoadingMs - elapsed);
      setTimeout(() => setLoading(false), remaining);
    };
    try {
      const { preference: pref, customerId: cid } = await useCase.get();
      setCustomerId(cid);
      setPreference(pref);
    } catch {
      setError(true);
    } finally {
      scheduleDone();
    }
  }, [useCase]);

  useEffect(() => {
    load();
  }, [load]);

  const updatePreference = useCallback(
    async (
      theme: string | null,
      language: string | null,
      notificationsEnabled: boolean
    ): Promise<boolean> => {
      if (!customerId) return false;
      const updated = await useCase.update(customerId, {
        theme,
        language,
        notificationsEnabled,
      });
      if (updated) {
        setPreference(updated);
        return true;
      }
      return false;
    },
    [customerId, useCase]
  );

  return {
    preference,
    customerId,
    loading,
    error,
    refresh: load,
    updatePreference,
  };
}
