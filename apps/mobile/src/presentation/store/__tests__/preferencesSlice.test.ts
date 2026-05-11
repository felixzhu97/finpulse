import * as preferencesSliceModule from "../../../presentation/store/preferencesSlice";

const {
  preferencesSlice,
  setTheme,
  setLanguage,
  setNotificationsEnabled,
  setPreferences,
  setLoading,
} = preferencesSliceModule;

describe("preferencesSlice", () => {
  const initialState = preferencesSlice.getInitialState();

  describe("initial state", () => {
    it("should have dark theme by default", () => {
      expect(initialState.theme).toBe("dark");
    });

    it("should have English language by default", () => {
      expect(initialState.language).toBe("en");
    });

    it("should have notifications enabled by default", () => {
      expect(initialState.notificationsEnabled).toBe(true);
    });

    it("should not be loading by default", () => {
      expect(initialState.isLoading).toBe(false);
    });

    it("should have null lastUpdated by default", () => {
      expect(initialState.lastUpdated).toBeNull();
    });
  });

  describe("setTheme action", () => {
    it("should set theme to light", () => {
      const action = setTheme("light");
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.theme).toBe("light");
      expect(state.lastUpdated).not.toBeNull();
    });

    it("should set theme to dark", () => {
      const stateWithLight = preferencesSlice.reducer(initialState, setTheme("light"));
      const action = setTheme("dark");
      const state = preferencesSlice.reducer(stateWithLight, action);

      expect(state.theme).toBe("dark");
    });

    it("should set theme to auto", () => {
      const action = setTheme("auto");
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.theme).toBe("auto");
    });

    it("should set theme to null", () => {
      const action = setTheme(null);
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.theme).toBeNull();
    });

    it("should update lastUpdated timestamp", () => {
      const beforeTime = Date.now();
      const action = setTheme("light");
      const state = preferencesSlice.reducer(initialState, action);
      const afterTime = Date.now();

      expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("setLanguage action", () => {
    it("should set language to Chinese", () => {
      const action = setLanguage("zh-CN");
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.language).toBe("zh-CN");
    });

    it("should set language to Japanese", () => {
      const action = setLanguage("ja");
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.language).toBe("ja");
    });

    it("should set language to null", () => {
      const action = setLanguage(null);
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.language).toBeNull();
    });

    it("should update lastUpdated timestamp", () => {
      const beforeTime = Date.now();
      const action = setLanguage("fr");
      const state = preferencesSlice.reducer(initialState, action);
      const afterTime = Date.now();

      expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
    });

    it("should handle various language codes", () => {
      const languages = ["en", "zh-CN", "ja", "ko", "fr", "de", "es"];

      languages.forEach((lang) => {
        const action = setLanguage(lang);
        const state = preferencesSlice.reducer(initialState, action);
        expect(state.language).toBe(lang);
      });
    });
  });

  describe("setNotificationsEnabled action", () => {
    it("should disable notifications", () => {
      const action = setNotificationsEnabled(false);
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.notificationsEnabled).toBe(false);
    });

    it("should enable notifications", () => {
      const stateWithDisabled = preferencesSlice.reducer(initialState, setNotificationsEnabled(false));
      const action = setNotificationsEnabled(true);
      const state = preferencesSlice.reducer(stateWithDisabled, action);

      expect(state.notificationsEnabled).toBe(true);
    });

    it("should update lastUpdated timestamp", () => {
      const beforeTime = Date.now();
      const action = setNotificationsEnabled(false);
      const state = preferencesSlice.reducer(initialState, action);
      const afterTime = Date.now();

      expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("setPreferences action", () => {
    it("should set all preferences at once", () => {
      const action = setPreferences({
        theme: "light",
        language: "ja",
        notificationsEnabled: false,
      });
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.theme).toBe("light");
      expect(state.language).toBe("ja");
      expect(state.notificationsEnabled).toBe(false);
      expect(state.lastUpdated).not.toBeNull();
    });

    it("should update lastUpdated when setting all preferences", () => {
      const beforeTime = Date.now();
      const action = setPreferences({
        theme: "auto",
        language: "ko",
        notificationsEnabled: true,
      });
      const state = preferencesSlice.reducer(initialState, action);
      const afterTime = Date.now();

      expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("setLoading action", () => {
    it("should set loading to true", () => {
      const action = setLoading(true);
      const state = preferencesSlice.reducer(initialState, action);

      expect(state.isLoading).toBe(true);
    });

    it("should set loading to false", () => {
      const stateWithLoading = preferencesSlice.reducer(initialState, setLoading(true));
      const action = setLoading(false);
      const state = preferencesSlice.reducer(stateWithLoading, action);

      expect(state.isLoading).toBe(false);
    });

    it("should not affect lastUpdated when setting loading", () => {
      const stateWithTime = preferencesSlice.reducer(initialState, setTheme("light"));
      const originalLastUpdated = stateWithTime.lastUpdated;

      const stateWithLoading = preferencesSlice.reducer(stateWithTime, setLoading(true));

      expect(stateWithLoading.lastUpdated).toBe(originalLastUpdated);
    });
  });

  describe("preference changes tracking", () => {
    it("should track multiple preference changes", () => {
      let state = initialState;

      state = preferencesSlice.reducer(state, setTheme("light"));
      expect(state.lastUpdated).toBeGreaterThan(0);
      const afterTheme = state.lastUpdated;

      // Small delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) { /* wait */ }

      state = preferencesSlice.reducer(state, setLanguage("zh-CN"));
      expect(state.lastUpdated).toBeGreaterThanOrEqual(afterTheme);
      const afterLanguage = state.lastUpdated;

      state = preferencesSlice.reducer(state, setNotificationsEnabled(false));
      expect(state.lastUpdated).toBeGreaterThanOrEqual(afterLanguage);
    });
  });
});
