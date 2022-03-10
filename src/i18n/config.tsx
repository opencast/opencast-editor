import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import locales from './locales/locales.json';

const debug = Boolean(new URLSearchParams(window.location.search).get('debug'));

const resources: any = {};
for (const lang of locales) {
  const code = lang.replace(/\..*$/, '');
  import('./locales/' + lang)
  .then(translations => {
    resources[code] = { translation: translations };
  })
}

console.warn(typeof resources);

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        fallbackLng: 'en',
        debug: debug,
  });
