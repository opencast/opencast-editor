import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import locales from './locales/locales.json';

const debug = Boolean(new URLSearchParams(window.location.search).get('debug'));

const resources: any = {};
for (const lang of locales) {
  const code = lang.replace(/\..*$/, '');
  const short = code.replace(/-.*$/, '');
  const main = locales.filter(l => l.indexOf(short) === 0).length === 1
  import('./locales/' + lang)
  .then(translations => {
    if (!main) {
      resources[code] = { translation: translations };
    }
    resources[short] = { translation: translations };
  })
}

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        fallbackLng: 'en-US',
        nonExplicitSupportedLngs: true,
        debug: debug,
  });

if (debug) {
  console.debug('language', i18n.language);
  console.debug('languages', i18n.languages);
}
