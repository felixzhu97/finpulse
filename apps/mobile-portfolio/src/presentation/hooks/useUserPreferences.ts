import { useCallback, useEffect, useState } from "react";
import type { UserPreference } from "../../domain/entities/userPreference";
import { container } from "../../application/services/DependencyContainer";

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

  const customerRepository = container.getCustomerRepository();
  const userPreferenceRepository = container.getUserPreferenceRepository();

  const minLoadingMs = 400;
  const maxLoadingMs = 10000;

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
      const customer = await customerRepository.getFirst();
      if (!customer) {
        setCustomerId(null);
        setPreference(null);
        scheduleDone();
        return;
      }
      setCustomerId(customer.customer_id);
      const pref = await userPreferenceRepository.getByCustomerId(customer.customer_id);
      setPreference(pref ?? null);
      if (!pref && customer) {
        const { httpClient } = await import("../../infrastructure/api/httpClient");
        const created = await httpClient.post<UserPreference>("user-preferences", {
          customer_id: customer.customer_id,
          theme: null,
          language: null,
          notifications_enabled: true,
        });
        setPreference(created ?? null);
      }
    } catch {
      setError(true);
    } finally {
      scheduleDone();
    }
  }, [customerRepository, userPreferenceRepository]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const updatePreference = useCallback(
    async (
      theme: string | null,
      language: string | null,
      notificationsEnabled: boolean
    ): Promise<boolean> => {
      if (!customerId) return false;
      const updated = await userPreferenceRepository.update(customerId, {
        theme,
        language,
        notifications_enabled: notificationsEnabled,
      });
      if (updated) {
        setPreference(updated);
        return true;
      }
      return false;
    },
    [customerId, userPreferenceRepository]
  );

  return {
    preference,
    customerId,
    loading,
    error,
    refresh,
    updatePreference,
  };
}
