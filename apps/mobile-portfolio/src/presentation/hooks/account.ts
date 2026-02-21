import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import type { Account } from "../../domain/entities/portfolio";
import type { AccountResource } from "../../domain/entities/accountResource";
import type { Customer } from "../../domain/entities/customer";
import type { UserPreference } from "../../domain/entities/userPreference";
import type { UpdatePreferenceInput } from "../../domain/dto";
import {
  getAccountData,
  getUserPreference,
  updateUserPreference,
} from "../../infrastructure/api";
import { useAsyncLoad } from "./common";
import { useAppDispatch, useAppSelector } from "../store";
import {
  setPreferences,
  setTheme,
  setLanguage,
  setNotificationsEnabled,
  type ThemePreference,
} from "../store/preferencesSlice";
import { i18n } from "../i18n";

export interface UseAccountDataResult {
  customer: Customer | null;
  accounts: Account[];
  accountResources: AccountResource[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useAccountData(): UseAccountDataResult {
  const fetcher = useCallback(() => getAccountData(), []);
  const { data, loading, error, refresh } = useAsyncLoad(fetcher, null, {
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
      const { preference: pref, customerId: cid } = await getUserPreference();
      setCustomerId(cid);
      setPreference(pref);
    } catch {
      setError(true);
    } finally {
      scheduleDone();
    }
  }, []);

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
      const updated = await updateUserPreference(customerId, {
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
    [customerId]
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

export function usePreferences() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((s) => s.preferences);
  const {
    preference: apiPreference,
    customerId,
    loading: apiLoading,
    refresh: refreshApi,
  } = useUserPreferences();

  useEffect(() => {
    if (apiPreference) {
      const language = apiPreference.language || "en";
      dispatch(
        setPreferences({
          theme: (apiPreference.theme as ThemePreference) || "dark",
          language,
          notificationsEnabled: apiPreference.notifications_enabled,
        })
      );
      i18n.changeLanguage(language);
    }
  }, [apiPreference, dispatch]);

  const updatePreference = useCallback(
    async (partial: UpdatePreferenceInput): Promise<boolean> => {
      if (!customerId) return false;
      const themeVal = preferences.theme === "auto" ? null : preferences.theme;
      const data: UpdatePreferenceInput = {
        theme: partial.theme ?? themeVal,
        language: partial.language ?? preferences.language,
        notificationsEnabled: partial.notificationsEnabled ?? preferences.notificationsEnabled,
      };
      try {
        const updated = await updateUserPreference(customerId, data);
        if (updated) {
          await refreshApi();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [customerId, preferences, refreshApi]
  );

  const updateTheme = useCallback(
    (theme: ThemePreference) =>
      updatePreference({ theme: theme === "auto" ? null : theme }),
    [updatePreference]
  );
  const updateLanguage = useCallback(
    async (language: string | null) => {
      dispatch(setLanguage(language));
      if (language) i18n.changeLanguage(language);
      return updatePreference({ language });
    },
    [dispatch, updatePreference]
  );
  const updateNotifications = useCallback(
    async (enabled: boolean) => {
      dispatch(setNotificationsEnabled(enabled));
      return updatePreference({ notificationsEnabled: enabled });
    },
    [dispatch, updatePreference]
  );

  return {
    theme: preferences.theme,
    language: preferences.language,
    notificationsEnabled: preferences.notificationsEnabled,
    loading: apiLoading,
    isLoading: apiLoading,
    updateTheme,
    updateLanguage,
    updateNotifications,
    refresh: refreshApi,
  };
}
