import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/useAppStore";
import {
  setPreferences,
  setTheme,
  setLanguage,
  setNotificationsEnabled,
  type ThemePreference,
} from "../store/preferencesSlice";
import { useUserPreferences } from "./useUserPreferences";
import { container } from "../../application";
import { i18n } from "../i18n";
import type { UpdatePreferenceInput } from "../../application/usecases/UserPreferenceUseCase";

export function usePreferences() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((s) => s.preferences);
  const {
    preference: apiPreference,
    customerId,
    loading: apiLoading,
    refresh: refreshApi,
  } = useUserPreferences();

  const useCase = useMemo(() => container.getUserPreferenceUseCase(), []);

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
        const updated = await useCase.update(customerId, data);
        if (updated) {
          await refreshApi();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [customerId, preferences, refreshApi, useCase]
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
