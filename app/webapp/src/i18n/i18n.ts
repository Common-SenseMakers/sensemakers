import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export enum I18Keys {
  connectTwitterBtn = 's004',
}

const translationENG: Record<I18Keys, string> = {
  [I18Keys.connectTwitterBtn]: 'Connect',
};

i18n.use(initReactI18next).init({
  resources: {
    ENG: {
      translation: translationENG,
    },
  },
  lng: 'ENG', // default language
  fallbackLng: 'ENG',

  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
