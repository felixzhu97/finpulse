import type { UserPreference, UserPreferenceCreate } from "@/src/types/userPreference";

// ============================================================
// Domain Test Values - 领域测试值
// ============================================================
const PREFERENCE_DOMAIN = {
  THEMES: ["light", "dark", "auto"] as const,
  LANGUAGES: ["en", "zh-CN", "zh-TW", "ja", "ko", "fr", "de", "es", "pt", "ru"] as const,
  BOOLEAN_STATES: [true, false] as const,
  IDS: {
    PREFIX: "PREF",
    CUSTOMER_PREFIX: "CUST",
    TEST: "PREF001",
    CUSTOMER: "CUST001",
  } as const,
  TIMESTAMPS: {
    NOW: "2024-01-15T10:00:00Z",
    LATER: "2024-01-16T10:00:00Z",
    ISO_MILLIS: "2024-01-15T10:30:00.000Z",
  } as const,
} as const;

const BOUNDARY_VALUES = {
  THEME: [
    { value: "light", desc: "light theme" },
    { value: "dark", desc: "dark theme" },
    { value: "auto", desc: "auto theme" },
    { value: null, desc: "null theme" },
  ],
  LANGUAGE: [
    { value: "en", desc: "English" },
    { value: "zh-CN", desc: "Simplified Chinese" },
    { value: "zh-TW", desc: "Traditional Chinese" },
    { value: "ja", desc: "Japanese" },
    { value: null, desc: "null language" },
  ],
  NOTIFICATIONS: [
    { value: true, desc: "enabled" },
    { value: false, desc: "disabled" },
  ],
} as const;

// ============================================================
// Factory Functions - 工厂函数
// ============================================================
const createUserPreference = (
  overrides: Partial<UserPreference> = {}
): UserPreference => ({
  preference_id: PREFERENCE_DOMAIN.IDS.TEST,
  customer_id: PREFERENCE_DOMAIN.IDS.CUSTOMER,
  theme: "dark",
  language: "en",
  notifications_enabled: true,
  updated_at: PREFERENCE_DOMAIN.TIMESTAMPS.NOW,
  ...overrides,
});

const createUserPreferenceCreate = (
  overrides: Partial<UserPreferenceCreate> = {}
): UserPreferenceCreate => ({
  customer_id: PREFERENCE_DOMAIN.IDS.CUSTOMER,
  theme: "dark",
  language: "en",
  notifications_enabled: true,
  ...overrides,
});

// ============================================================
// Test Suites
// ============================================================
describe("UserPreference Entity", () => {
  describe("UserPreference interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete preference data", () => {
        // Arrange
        const preference = createUserPreference();

        // Assert
        expect(preference.preference_id).toBe(PREFERENCE_DOMAIN.IDS.TEST);
        expect(preference.customer_id).toBe(PREFERENCE_DOMAIN.IDS.CUSTOMER);
        expect(preference.theme).toBe("dark");
        expect(preference.language).toBe("en");
        expect(preference.notifications_enabled).toBe(true);
        expect(preference.updated_at).toBe(PREFERENCE_DOMAIN.TIMESTAMPS.NOW);
      });
    });

    describe("when validating theme options", () => {
      it.each(BOUNDARY_VALUES.THEME)("should accept $desc", ({ value }) => {
        const preference = createUserPreference({ theme: value });
        expect(preference.theme).toBe(value);
      });
    });

    describe("when validating language options", () => {
      it.each(BOUNDARY_VALUES.LANGUAGE)("should accept $desc", ({ value }) => {
        const preference = createUserPreference({ language: value });
        expect(preference.language).toBe(value);
      });
    });

    describe("when validating notification states", () => {
      it.each(BOUNDARY_VALUES.NOTIFICATIONS)(
        "should accept notifications $desc",
        ({ value }) => {
          const preference = createUserPreference({
            notifications_enabled: value,
          });
          expect(preference.notifications_enabled).toBe(value);
        }
      );
    });

    describe("when handling timestamps", () => {
      it("should accept ISO timestamp format", () => {
        const preference = createUserPreference({
          updated_at: PREFERENCE_DOMAIN.TIMESTAMPS.ISO_MILLIS,
        });
        expect(new Date(preference.updated_at).toISOString()).toBe(
          PREFERENCE_DOMAIN.TIMESTAMPS.ISO_MILLIS
        );
      });
    });

    describe("when modeling user scenarios", () => {
      it.each([
        {
          theme: "dark",
          language: "en",
          notifications: false,
          desc: "privacy-conscious user",
        },
        {
          theme: "light",
          language: "zh-CN",
          notifications: true,
          desc: "international user",
        },
        {
          theme: "auto",
          language: "en",
          notifications: true,
          desc: "auto theme user",
        },
        {
          theme: null,
          language: null,
          notifications: true,
          desc: "user with no preferences",
        },
      ])("should model $desc", ({ theme, language, notifications }) => {
        const preference = createUserPreference({
          preference_id: `PREF_${theme ?? "null"}_${language ?? "null"}`,
          theme,
          language,
          notifications_enabled: notifications,
        });

        expect(preference.theme).toBe(theme);
        expect(preference.language).toBe(language);
        expect(preference.notifications_enabled).toBe(notifications);
      });
    });

    describe("when handling multiple preferences", () => {
      it("should support multiple preferences per customer", () => {
        const customerId = PREFERENCE_DOMAIN.IDS.CUSTOMER;
        const preferences: UserPreference[] = [
          createUserPreference({
            preference_id: "PREF001",
            customer_id: customerId,
            theme: "dark",
            language: "en",
          }),
          createUserPreference({
            preference_id: "PREF002",
            customer_id: customerId,
            theme: "light",
            language: "zh-CN",
            notifications_enabled: false,
          }),
        ];

        expect(preferences).toHaveLength(2);
        expect(preferences.every((p) => p.customer_id === customerId)).toBe(
          true
        );
      });
    });
  });

  describe("UserPreferenceCreate interface", () => {
    describe("when providing valid data", () => {
      it("should accept complete preference creation data", () => {
        // Arrange
        const create = createUserPreferenceCreate();

        // Assert
        expect(create.customer_id).toBe(PREFERENCE_DOMAIN.IDS.CUSTOMER);
        expect(create.theme).toBe("dark");
        expect(create.language).toBe("en");
        expect(create.notifications_enabled).toBe(true);
      });
    });

    describe("when validating required fields", () => {
      it("should require customer_id", () => {
        const create = createUserPreferenceCreate({
          customer_id: PREFERENCE_DOMAIN.IDS.CUSTOMER,
        });
        expect(create.customer_id).toBeDefined();
      });
    });

    describe("when handling optional fields", () => {
      it.each([
        { field: "theme", value: "light", desc: "with theme" },
        { field: "theme", value: null, desc: "with null theme" },
        { field: "theme", value: undefined, desc: "without theme" },
        { field: "language", value: "ja", desc: "with language" },
        { field: "language", value: null, desc: "with null language" },
        { field: "language", value: undefined, desc: "without language" },
        { field: "notifications_enabled", value: false, desc: "with disabled notifications" },
        { field: "notifications_enabled", value: undefined, desc: "without notifications" },
      ])("should accept $desc", ({ field, value }) => {
        const create = createUserPreferenceCreate({
          [field]: value,
        } as Partial<UserPreferenceCreate>);

        if (value === undefined) {
          expect(create[field]).toBeUndefined();
        } else {
          expect(create[field]).toBe(value);
        }
      });
    });

    describe("when validating minimal creation", () => {
      it("should accept minimal data with only customer_id", () => {
        const create = createUserPreferenceCreate({
          customer_id: PREFERENCE_DOMAIN.IDS.CUSTOMER,
          theme: undefined,
          language: undefined,
          notifications_enabled: undefined,
        });

        expect(create.customer_id).toBe(PREFERENCE_DOMAIN.IDS.CUSTOMER);
        expect(create.theme).toBeUndefined();
        expect(create.language).toBeUndefined();
        expect(create.notifications_enabled).toBeUndefined();
      });
    });

    describe("when converting to UserPreference", () => {
      it("should properly map create to preference fields", () => {
        // Arrange
        const create = createUserPreferenceCreate({
          theme: "dark",
          language: "ja",
          notifications_enabled: false,
        });

        // Act
        const preference: UserPreference = {
          preference_id: "PREF_NEW",
          customer_id: create.customer_id,
          theme: create.theme ?? null,
          language: create.language ?? null,
          notifications_enabled: create.notifications_enabled ?? true,
          updated_at: new Date().toISOString(),
        };

        // Assert
        expect(preference.theme).toBe("dark");
        expect(preference.language).toBe("ja");
        expect(preference.notifications_enabled).toBe(false);
      });
    });
  });
});
