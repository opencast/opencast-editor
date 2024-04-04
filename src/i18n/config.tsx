import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ChainedBackend, { ChainedBackendOptions } from "i18next-chained-backend";
import resourcesToBackend from "i18next-resources-to-backend";

import LazyLoadingPlugin from "./LazyLoadingPlugin";

const debug = Boolean(new URLSearchParams(window.location.search).get("debug"));

const bundledResources = {
  en: {
    translation: import("./locales/en.json"),
  },
};

export const locales: string[] = ["de", "el", "en", "es", "fr", "nl", "zh-CN", "zh-TW"];

i18next
  .use(ChainedBackend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init<ChainedBackendOptions>({
    supportedLngs: locales,
    fallbackLng: ["en"],
    nonExplicitSupportedLngs: false,
    debug: debug,
    backend: {
      backends: [
        LazyLoadingPlugin,
        resourcesToBackend(bundledResources),
      ],
    },
  });

if (debug) {
  console.debug("language", i18next.language);
  console.debug("languages", i18next.languages);
}

export default i18next;
