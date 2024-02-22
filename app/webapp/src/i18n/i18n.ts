import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ENG: {
      translation: {
        connectedAs: 'Connected as',
        connect: 'Login',
        connectBtn: 'Login with ORCID',
      },
    },
  },
  lng: 'ENG', // default language
  fallbackLng: 'ENG',

  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
