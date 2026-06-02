import i18n from "i18next";
import type { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import zhTranslations from "./locales/zh.json";

const resources = {
  en: { translation: enTranslations },
  zh: { translation: zhTranslations },
};

const options: InitOptions = {
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
};

i18n.use(initReactI18next).init(options);

export default i18n;
