import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export enum I18Keys {
  connectTwitterBtn = 's004',
  introTitle = 's005',
  introSubtitle = 's006',
  introParagraph1 = 's007',
  introParagraph2 = 's008',
  startBtn = 's009',
  connectAccounts = 's010',
  connectParagraph = 's011',
  signInX = 's012',
  errorConnectTwitter = 's013',
  yourPublications = 's014',
  TweetX = 's015',
  ThreadX = 's016',
}

const translationENG: Record<I18Keys, string> = {
  [I18Keys.connectTwitterBtn]: 'Connect',
  [I18Keys.introTitle]: 'Your ideas matter',
  [I18Keys.introSubtitle]:
    'Transform your social media activity into meaningful scientific contributions',
  [I18Keys.introParagraph1]:
    'Social media posts are a valuable source of scientific knowledge, but they get buried in noisy feeds and locked away by platforms.',
  [I18Keys.introParagraph2]:
    'Harness this knowledge by converting your social media posts into nanopublications, making your content <b>FAIR</b> (<b>F</b>indable, <b>A</b>ccessible, <b>I</b>nteroperable and <b>R</b>eusable), so your contributions can get proper recognition',
  [I18Keys.startBtn]: 'Start nanopublishing now',
  [I18Keys.connectAccounts]: 'Connect your accounts',
  [I18Keys.connectParagraph]:
    'SenseNet loads your X (Twitter) feed and analyzes your posts using AI to deduct keywords and relations, which can be used to better interpret the meaning of your content.',
  [I18Keys.signInX]: 'Sign in with X',
  [I18Keys.errorConnectTwitter]: 'Error connecting Twitter',
  [I18Keys.yourPublications]: 'Your publications',
  [I18Keys.TweetX]: 'X · Tweet',
  [I18Keys.ThreadX]: 'X · Thread',
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
