import type {UserPreference} from "@/src/types";
import {useCallback, useEffect, useState} from "react";
import {getUserPreference, updateUserPreference} from "@/src/lib";
import {useAppDispatch, useAppSelector} from "@/src/store";
import {setLanguage, setNotificationsEnabled, setPreferences, type ThemePreference} from "@/src/store/preferencesSlice";
import {i18n} from "@/src/lib/i18n";
import type {UpdatePreferenceInput} from "@/src/types/dto";

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
            const {preference: pref, customerId: cid} = await getUserPreference();
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
            updatePreference({theme: theme === "auto" ? null : theme}),
        [updatePreference]
    );
    const updateLanguage = useCallback(
        async (language: string | null) => {
            dispatch(setLanguage(language));
            if (language) i18n.changeLanguage(language);
            return updatePreference({language});
        },
        [dispatch, updatePreference]
    );
    const updateNotifications = useCallback(
        async (enabled: boolean) => {
            dispatch(setNotificationsEnabled(enabled));
            return updatePreference({notificationsEnabled: enabled});
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