/**
 * Preferences Slice Tests - TDD Optimized
 * Following TDD Best Practices: AAA Pattern, Domain Values, Factory Functions, Boundary Testing
 */
import * as preferencesSliceModule from "../../../presentation/store/preferencesSlice";
import type { ThemePreference } from "../../../presentation/store/preferencesSlice";

const {
  preferencesSlice,
  setTheme,
  setLanguage,
  setNotificationsEnabled,
  setPreferences,
  setLoading,
} = preferencesSliceModule;

/**
 * Domain Test Values - Standardized test data for preferences slice
 */
const DOMAIN_VALUES = {
  THEME: {
    VALID: ["dark", "light", "auto"] as ThemePreference[],
    EDGE_CASES: {
      NULL: null,
    },
  },
  LANGUAGE: {
    VALID: ["en", "zh-CN", "ja", "ko", "fr", "de", "es"],
    EDGE_CASES: {
      NULL: null,
      REGIONAL: ["zh-TW", "pt-BR", "es-MX"],
    },
  },
  NOTIFICATIONS: {
    ENABLED: true,
    DISABLED: false,
  },
  TIMESTAMP: {
    BOUNDARY: {
      BEFORE: 0,
      MIN_VALUE: 1,
      LARGE_VALUE: 9999999999999,
    },
  },
} as const;

/**
 * Factory function for creating test preferences state
 */
const createPreferencesState = (overrides: {
  theme?: ThemePreference;
  language?: string | null;
  notificationsEnabled?: boolean;
  isLoading?: boolean;
  lastUpdated?: number | null;
} = {}) => ({
  theme: "dark" as ThemePreference,
  language: "en",
  notificationsEnabled: true,
  isLoading: false,
  lastUpdated: null,
  ...overrides,
});

/**
 * Factory function for creating preferences payload
 */
const createPreferencesPayload = (overrides: {
  theme?: ThemePreference;
  language?: string | null;
  notificationsEnabled?: boolean;
} = {}) => ({
  theme: "dark" as ThemePreference,
  language: "en",
  notificationsEnabled: true,
  ...overrides,
});

describe("preferencesSlice", () => {
  // Shared fixture - initial state
  let initialState: ReturnType<typeof preferencesSlice.getInitialState>;

  beforeEach(() => {
    initialState = preferencesSlice.getInitialState();
  });

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
    describe("when setting theme", () => {
      it.each(DOMAIN_VALUES.THEME.VALID)("should set theme to %s", (theme) => {
        // Act
        const action = setTheme(theme);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.theme).toBe(theme);
      });

      it("should update lastUpdated timestamp", () => {
        // Arrange
        const beforeTime = Date.now();

        // Act
        const action = setTheme("light");
        const state = preferencesSlice.reducer(initialState, action);
        const afterTime = Date.now();

        // Assert
        expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
        expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
      });
    });

    describe("when toggling theme", () => {
      it("should transition from dark to light", () => {
        // Arrange
        const stateWithDark = preferencesSlice.reducer(initialState, setTheme("dark"));

        // Act
        const action = setTheme("light");
        const state = preferencesSlice.reducer(stateWithDark, action);

        // Assert
        expect(state.theme).toBe("light");
      });

      it("should transition from light to dark", () => {
        // Arrange
        const stateWithLight = preferencesSlice.reducer(initialState, setTheme("light"));

        // Act
        const action = setTheme("dark");
        const state = preferencesSlice.reducer(stateWithLight, action);

        // Assert
        expect(state.theme).toBe("dark");
      });
    });

    describe("when setting null theme", () => {
      it("should set theme to null", () => {
        // Act
        const action = setTheme(null);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.theme).toBeNull();
      });
    });

    describe("boundary value testing", () => {
      it.each(DOMAIN_VALUES.THEME.VALID)(
        "should accept valid theme: %s",
        (theme) => {
          // Act
          const action = setTheme(theme);
          const state = preferencesSlice.reducer(initialState, action);

          // Assert
          expect(state.theme).toBe(theme);
        }
      );

      it("should handle null theme", () => {
        // Act
        const action = setTheme(null);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.theme).toBeNull();
      });
    });
  });

  describe("setLanguage action", () => {
    describe("when setting language", () => {
      it.each(DOMAIN_VALUES.LANGUAGE.VALID)(
        "should set language to %s",
        (language) => {
          // Act
          const action = setLanguage(language);
          const state = preferencesSlice.reducer(initialState, action);

          // Assert
          expect(state.language).toBe(language);
        }
      );

      it.each(DOMAIN_VALUES.LANGUAGE.EDGE_CASES.REGIONAL)(
        "should handle regional language: %s",
        (language) => {
          // Act
          const action = setLanguage(language);
          const state = preferencesSlice.reducer(initialState, action);

          // Assert
          expect(state.language).toBe(language);
        }
      );

      it("should update lastUpdated timestamp", () => {
        // Arrange
        const beforeTime = Date.now();

        // Act
        const action = setLanguage("fr");
        const state = preferencesSlice.reducer(initialState, action);
        const afterTime = Date.now();

        // Assert
        expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
        expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
      });
    });

    describe("when setting null language", () => {
      it("should set language to null", () => {
        // Act
        const action = setLanguage(null);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.language).toBeNull();
      });
    });

    describe("boundary value testing", () => {
      it.each(DOMAIN_VALUES.LANGUAGE.VALID)(
        "should handle valid language code: %s",
        (language) => {
          // Act
          const action = setLanguage(language);
          const state = preferencesSlice.reducer(initialState, action);

          // Assert
          expect(state.language).toBe(language);
        }
      );

      it("should handle null language", () => {
        // Act
        const action = setLanguage(null);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.language).toBeNull();
      });
    });
  });

  describe("setNotificationsEnabled action", () => {
    describe("when toggling notifications", () => {
      it("should disable notifications", () => {
        // Act
        const action = setNotificationsEnabled(false);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.notificationsEnabled).toBe(false);
      });

      it("should enable notifications", () => {
        // Arrange
        const stateWithDisabled = preferencesSlice.reducer(
          initialState,
          setNotificationsEnabled(false)
        );

        // Act
        const action = setNotificationsEnabled(true);
        const state = preferencesSlice.reducer(stateWithDisabled, action);

        // Assert
        expect(state.notificationsEnabled).toBe(true);
      });

      it("should update lastUpdated timestamp", () => {
        // Arrange
        const beforeTime = Date.now();

        // Act
        const action = setNotificationsEnabled(false);
        const state = preferencesSlice.reducer(initialState, action);
        const afterTime = Date.now();

        // Assert
        expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
        expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
      });
    });

    describe("boundary value testing", () => {
      it.each([true, false])(
        "should handle notification enabled value: %s",
        (enabled) => {
          // Act
          const action = setNotificationsEnabled(enabled);
          const state = preferencesSlice.reducer(initialState, action);

          // Assert
          expect(state.notificationsEnabled).toBe(enabled);
        }
      );
    });
  });

  describe("setPreferences action", () => {
    describe("when setting all preferences at once", () => {
      it("should set theme, language, and notifications", () => {
        // Arrange
        const payload = createPreferencesPayload({
          theme: "light",
          language: "ja",
          notificationsEnabled: false,
        });

        // Act
        const action = setPreferences(payload);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.theme).toBe("light");
        expect(state.language).toBe("ja");
        expect(state.notificationsEnabled).toBe(false);
      });

      it("should update lastUpdated timestamp", () => {
        // Arrange
        const beforeTime = Date.now();
        const payload = createPreferencesPayload({
          theme: "auto",
          language: "ko",
          notificationsEnabled: true,
        });

        // Act
        const action = setPreferences(payload);
        const state = preferencesSlice.reducer(initialState, action);
        const afterTime = Date.now();

        // Assert
        expect(state.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
        expect(state.lastUpdated).toBeLessThanOrEqual(afterTime);
      });
    });

    describe("boundary value testing", () => {
      it.each([
        { theme: "dark", language: "en", notificationsEnabled: true },
        { theme: "light", language: "zh-CN", notificationsEnabled: false },
        { theme: "auto", language: "ja", notificationsEnabled: true },
        { theme: null, language: null, notificationsEnabled: false },
      ])(
        "should handle preferences: $description",
        (prefs) => {
          // Act
          const action = setPreferences(prefs as any);
          const state = preferencesSlice.reducer(initialState, action);

          // Assert
          expect(state.theme).toBe(prefs.theme);
          expect(state.language).toBe(prefs.language);
          expect(state.notificationsEnabled).toBe(prefs.notificationsEnabled);
        }
      );
    });
  });

  describe("setLoading action", () => {
    describe("when setting loading state", () => {
      it("should set loading to true", () => {
        // Act
        const action = setLoading(true);
        const state = preferencesSlice.reducer(initialState, action);

        // Assert
        expect(state.isLoading).toBe(true);
      });

      it("should set loading to false", () => {
        // Arrange
        const stateWithLoading = preferencesSlice.reducer(
          initialState,
          setLoading(true)
        );

        // Act
        const action = setLoading(false);
        const state = preferencesSlice.reducer(stateWithLoading, action);

        // Assert
        expect(state.isLoading).toBe(false);
      });
    });

    describe("when loading should not affect lastUpdated", () => {
      it("should not affect lastUpdated when setting loading", () => {
        // Arrange
        const stateWithTime = preferencesSlice.reducer(initialState, setTheme("light"));
        const originalLastUpdated = stateWithTime.lastUpdated;

        // Act
        const stateWithLoading = preferencesSlice.reducer(
          stateWithTime,
          setLoading(true)
        );

        // Assert
        expect(stateWithLoading.lastUpdated).toBe(originalLastUpdated);
      });
    });
  });

  describe("preference changes tracking", () => {
    describe("when tracking multiple changes", () => {
      it("should track multiple preference changes with increasing timestamps", () => {
        // Arrange & Act
        let state = initialState;

        // Change theme
        state = preferencesSlice.reducer(state, setTheme("light"));
        expect(state.lastUpdated).toBeGreaterThan(0);
        const afterTheme = state.lastUpdated;

        // Small delay to ensure different timestamps
        const start = Date.now();
        while (Date.now() - start < 1) { /* wait for timestamp difference */ }

        // Change language
        state = preferencesSlice.reducer(state, setLanguage("zh-CN"));
        expect(state.lastUpdated).toBeGreaterThanOrEqual(afterTheme);
        const afterLanguage = state.lastUpdated;

        // Change notifications
        state = preferencesSlice.reducer(state, setNotificationsEnabled(false));
        expect(state.lastUpdated).toBeGreaterThanOrEqual(afterLanguage);

        // Final assertion
        expect(state.theme).toBe("light");
        expect(state.language).toBe("zh-CN");
        expect(state.notificationsEnabled).toBe(false);
      });
    });

    describe("timestamp monotonicity", () => {
      it("should maintain timestamp monotonicity across rapid changes", () => {
        // Arrange
        let state = initialState;
        let lastTimestamp = 0;

        // Rapidly change theme
        for (const theme of DOMAIN_VALUES.THEME.VALID) {
          state = preferencesSlice.reducer(state, setTheme(theme));
          expect(state.lastUpdated!).toBeGreaterThanOrEqual(lastTimestamp);
          lastTimestamp = state.lastUpdated!;
        }

        // All themes should have been set
        expect(state.theme).toBe("auto");
      });
    });
  });
});
