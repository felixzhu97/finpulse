import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/src/store";
import {
  setPreferences,
  setTheme,
  setLanguage,
  setNotificationsEnabled,
  setLoading,
  type ThemePreference,
} from "@/src/store/preferencesSlice";
import { useUserPreferences } from "./useUserPreferences";
import { userPreferencesApi } from "@/src/api";

export function usePreferences() {
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences);
  const {
    preference: apiPreference,
    customerId,
    loading: apiLoading,
    refresh: refreshApi,
  } = useUserPreferences();

  useEffect(() => {
    if (apiPreference) {
      dispatch(
        setPreferences({
          theme: (apiPreference.theme as ThemePreference) || "dark",
          language: apiPreference.language || "en",
          notificationsEnabled: apiPreference.notifications_enabled,
        })
      );
    }
  }, [apiPreference, dispatch]);

  useEffect(() => {
    dispatch(setLoading(apiLoading));
  }, [apiLoading, dispatch]);

  const updateTheme = useCallback(
    async (theme: ThemePreference) => {
      if (!customerId) {
        console.warn("Cannot update theme: customerId is null");
        return false;
      }
      dispatch(setTheme(theme));
      const themeValue = theme === "auto" ? null : theme;
      try {
        const existing = await userPreferencesApi.getByCustomerId(customerId);
        const body = {
          customer_id: customerId,
          theme: themeValue,
          language: preferences.language,
          notifications_enabled: preferences.notificationsEnabled,
        };
        if (existing) {
          const updated = await userPreferencesApi.update(
            existing.preference_id,
            body
          );
          if (updated) {
            await refreshApi();
            return true;
          }
          return false;
        }
        const created = await userPreferencesApi.create(body);
        if (created) {
          await refreshApi();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating theme:", error);
        return false;
      }
    },
    [customerId, preferences.language, preferences.notificationsEnabled, dispatch, refreshApi]
  );

  const updateLanguage = useCallback(
    async (language: string | null) => {
      if (!customerId) {
        console.warn("Cannot update language: customerId is null");
        return false;
      }
      dispatch(setLanguage(language));
      try {
        const existing = await userPreferencesApi.getByCustomerId(customerId);
        const body = {
          customer_id: customerId,
          theme: preferences.theme === "auto" ? null : preferences.theme,
          language,
          notifications_enabled: preferences.notificationsEnabled,
        };
        if (existing) {
          const updated = await userPreferencesApi.update(
            existing.preference_id,
            body
          );
          if (updated) {
            await refreshApi();
            return true;
          }
          return false;
        }
        const created = await userPreferencesApi.create(body);
        if (created) {
          await refreshApi();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating language:", error);
        return false;
      }
    },
    [customerId, preferences.theme, preferences.notificationsEnabled, dispatch, refreshApi]
  );

  const updateNotifications = useCallback(
    async (enabled: boolean) => {
      if (!customerId) {
        console.warn("Cannot update notifications: customerId is null");
        return false;
      }
      dispatch(setNotificationsEnabled(enabled));
      try {
        const existing = await userPreferencesApi.getByCustomerId(customerId);
        const body = {
          customer_id: customerId,
          theme: preferences.theme === "auto" ? null : preferences.theme,
          language: preferences.language,
          notifications_enabled: enabled,
        };
        if (existing) {
          const updated = await userPreferencesApi.update(
            existing.preference_id,
            body
          );
          if (updated) {
            await refreshApi();
            return true;
          }
          return false;
        }
        const created = await userPreferencesApi.create(body);
        if (created) {
          await refreshApi();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating notifications:", error);
        return false;
      }
    },
    [customerId, preferences.theme, preferences.language, dispatch, refreshApi]
  );

  return {
    theme: preferences.theme,
    language: preferences.language,
    notificationsEnabled: preferences.notificationsEnabled,
    isLoading: preferences.isLoading,
    updateTheme,
    updateLanguage,
    updateNotifications,
    refresh: refreshApi,
  };
}
