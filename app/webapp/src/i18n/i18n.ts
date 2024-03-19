import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export enum I18Keys {
  platformManagerOverview = 's001',
  connectTwitter = 's002',
  connectTwitterOverview = 's003',
  connectTwitterBtn = 's004',
  approveTwitterBtn = 's005',
}

const translationENG: Record<I18Keys, string> = {
  [I18Keys.platformManagerOverview]:
    'Connect the social networks you normally use for topics related to Science and get the posts automatically parsed and stored as FAIR content in the Nanopublications network.',
  [I18Keys.connectTwitter]: 'Connect Twitter/X',
  [I18Keys.connectTwitterOverview]:
    'Login with Twitter (enought for parsing and storing your tweets). Authorize posting to be able to create tweets from this app.',
  [I18Keys.connectTwitterBtn]: 'Connect',
  [I18Keys.approveTwitterBtn]: 'Approve Posting',
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
