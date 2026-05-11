import type { UserPreference, UserPreferenceCreate } from "../../../domain/entities/userPreference";

describe("UserPreference Entity", () => {
  describe("UserPreference interface", () => {
    it("should accept valid user preference data", () => {
      const preference: UserPreference = {
        preference_id: "PREF001",
        customer_id: "CUST001",
        theme: "dark",
        language: "en",
        notifications_enabled: true,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.preference_id).toBe("PREF001");
      expect(preference.customer_id).toBe("CUST001");
      expect(preference.theme).toBe("dark");
      expect(preference.language).toBe("en");
      expect(preference.notifications_enabled).toBe(true);
      expect(preference.updated_at).toBe("2024-01-15T10:00:00Z");
    });

    it("should accept null theme", () => {
      const preference: UserPreference = {
        preference_id: "PREF002",
        customer_id: "CUST001",
        theme: null,
        language: "en",
        notifications_enabled: true,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.theme).toBeNull();
    });

    it("should accept null language", () => {
      const preference: UserPreference = {
        preference_id: "PREF003",
        customer_id: "CUST001",
        theme: "dark",
        language: null,
        notifications_enabled: true,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.language).toBeNull();
    });

    it("should accept disabled notifications", () => {
      const preference: UserPreference = {
        preference_id: "PREF004",
        customer_id: "CUST001",
        theme: "light",
        language: "en",
        notifications_enabled: false,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.notifications_enabled).toBe(false);
    });

    it("should accept various theme values", () => {
      const themes = ["light", "dark", "auto"];

      themes.forEach((theme) => {
        const preference: UserPreference = {
          preference_id: `PREF_${theme}`,
          customer_id: "CUST001",
          theme,
          language: "en",
          notifications_enabled: true,
          updated_at: "2024-01-15T10:00:00Z",
        };

        expect(preference.theme).toBe(theme);
      });
    });

    it("should accept various language codes", () => {
      const languages = ["en", "zh-CN", "zh-TW", "ja", "ko", "fr", "de", "es", "pt", "ru"];

      languages.forEach((language) => {
        const preference: UserPreference = {
          preference_id: `PREF_${language}`,
          customer_id: "CUST001",
          theme: "dark",
          language,
          notifications_enabled: true,
          updated_at: "2024-01-15T10:00:00Z",
        };

        expect(preference.language).toBe(language);
      });
    });

    it("should handle ISO timestamp for updated_at", () => {
      const preference: UserPreference = {
        preference_id: "PREF005",
        customer_id: "CUST001",
        theme: "dark",
        language: "en",
        notifications_enabled: true,
        updated_at: "2024-01-15T10:30:00.000Z",
      };

      expect(new Date(preference.updated_at).toISOString()).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should support multiple preferences per customer", () => {
      const customerId = "CUST001";
      const preferences: UserPreference[] = [
        {
          preference_id: "PREF001",
          customer_id: customerId,
          theme: "dark",
          language: "en",
          notifications_enabled: true,
          updated_at: "2024-01-15T10:00:00Z",
        },
        {
          preference_id: "PREF002",
          customer_id: customerId,
          theme: "light",
          language: "zh-CN",
          notifications_enabled: false,
          updated_at: "2024-01-16T10:00:00Z",
        },
      ];

      expect(preferences).toHaveLength(2);
      expect(preferences.every((p) => p.customer_id === customerId)).toBe(true);
    });
  });

  describe("UserPreferenceCreate interface", () => {
    it("should accept valid preference creation data", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
        theme: "dark",
        language: "en",
        notifications_enabled: true,
      };

      expect(create.customer_id).toBe("CUST001");
      expect(create.theme).toBe("dark");
      expect(create.language).toBe("en");
      expect(create.notifications_enabled).toBe(true);
    });

    it("should require customer_id", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
      };

      expect(create.customer_id).toBeDefined();
    });

    it("should allow optional theme", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
        language: "en",
        notifications_enabled: true,
      };

      expect(create.theme).toBeUndefined();
    });

    it("should allow null theme", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
        theme: null,
        language: "en",
        notifications_enabled: true,
      };

      expect(create.theme).toBeNull();
    });

    it("should allow optional language", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
        theme: "dark",
        notifications_enabled: true,
      };

      expect(create.language).toBeUndefined();
    });

    it("should allow null language", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
        theme: "dark",
        language: null,
        notifications_enabled: true,
      };

      expect(create.language).toBeNull();
    });

    it("should allow optional notifications_enabled", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
        theme: "dark",
        language: "en",
      };

      expect(create.notifications_enabled).toBeUndefined();
    });

    it("should accept minimal creation data", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
      };

      expect(create.customer_id).toBeDefined();
      expect(create.theme).toBeUndefined();
      expect(create.language).toBeUndefined();
      expect(create.notifications_enabled).toBeUndefined();
    });
  });

  describe("User preference scenarios", () => {
    it("should model a privacy-conscious user", () => {
      const preference: UserPreference = {
        preference_id: "PREF_PRIVACY",
        customer_id: "CUST_PRIVACY",
        theme: "dark",
        language: "en",
        notifications_enabled: false,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.notifications_enabled).toBe(false);
    });

    it("should model an international user", () => {
      const preference: UserPreference = {
        preference_id: "PREF_INTL",
        customer_id: "CUST_INTL",
        theme: "light",
        language: "zh-CN",
        notifications_enabled: true,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.language).toBe("zh-CN");
      expect(preference.theme).toBe("light");
    });

    it("should model a user who prefers auto theme", () => {
      const preference: UserPreference = {
        preference_id: "PREF_AUTO",
        customer_id: "CUST_AUTO",
        theme: "auto",
        language: "en",
        notifications_enabled: true,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.theme).toBe("auto");
    });

    it("should model a user with no preferences set", () => {
      const preference: UserPreference = {
        preference_id: "PREF_NONE",
        customer_id: "CUST_NEW",
        theme: null,
        language: null,
        notifications_enabled: true,
        updated_at: "2024-01-15T10:00:00Z",
      };

      expect(preference.theme).toBeNull();
      expect(preference.language).toBeNull();
    });

    it("should convert create to preference", () => {
      const create: UserPreferenceCreate = {
        customer_id: "CUST001",
        theme: "dark",
        language: "ja",
        notifications_enabled: false,
      };

      const preference: UserPreference = {
        preference_id: "PREF_NEW",
        customer_id: create.customer_id,
        theme: create.theme ?? null,
        language: create.language ?? null,
        notifications_enabled: create.notifications_enabled ?? true,
        updated_at: new Date().toISOString(),
      };

      expect(preference.customer_id).toBe("CUST001");
      expect(preference.theme).toBe("dark");
      expect(preference.language).toBe("ja");
      expect(preference.notifications_enabled).toBe(false);
    });
  });
});
