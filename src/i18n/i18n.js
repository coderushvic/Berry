// src/i18n/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh.json";
import en from "./locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    lng: "zh", // Default to Chinese
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;