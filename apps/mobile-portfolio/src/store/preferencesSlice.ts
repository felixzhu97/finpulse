import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemePreference = "dark" | "light" | "auto" | null;

interface PreferencesState {
  theme: ThemePreference;
  language: string | null;
  notificationsEnabled: boolean;
  isLoading: boolean;
  lastUpdated: number | null;
}

const initialState: PreferencesState = {
  theme: "dark",
  language: "en",
  notificationsEnabled: true,
  isLoading: false,
  lastUpdated: null,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
      state.lastUpdated = Date.now();
    },
    setLanguage(state, action: PayloadAction<string | null>) {
      state.language = action.payload;
      state.lastUpdated = Date.now();
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
      state.lastUpdated = Date.now();
    },
    setPreferences(
      state,
      action: PayloadAction<{
        theme: ThemePreference;
        language: string | null;
        notificationsEnabled: boolean;
      }>
    ) {
      state.theme = action.payload.theme;
      state.language = action.payload.language;
      state.notificationsEnabled = action.payload.notificationsEnabled;
      state.lastUpdated = Date.now();
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setNotificationsEnabled,
  setPreferences,
  setLoading,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
