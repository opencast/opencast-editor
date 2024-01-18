// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import translation from '../i18n/locales/en-US.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof translation;
    };
  }
}
