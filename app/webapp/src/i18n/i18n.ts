import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export enum I18Keys {
  introTitle = 's005',
  introSubtitle = 's006',
  introParagraph1 = 's007',
  introParagraph2 = 's008',
  emailInputBtn = 's0095',

  connectSocialsTitle = 's0090',
  connectSocialsParagraph = 's0091',
  connectSocialsParagraph2 = 's0092',
  signInX = 's012',

  connectAccounts = 's010',
  connectParagraph = 's011',
  errorConnectTwitter = 's013',
  yourPublications = 's014',
  TweetX = 's015',
  ThreadX = 's016',
  addKeyword = 's017',
  profile = 's018',
  updateAvailable = 's019',
  updateNow = 's020',
  installPrompt = 's021',
  installNow = 's022',
  noMorePosts = 's023',
  settings = 's024',
  logout = 's025',

  drafts = 's026',

  introNextLabel = 's026x',
  introFinalLabel = 's026y',

  introHeading01 = 's027',
  introText011 = 's028',
  introText012 = 's029',

  introHeading02 = 's0272',
  introText021 = 's0282',
  introText022 = 's0292',

  introHeading03 = 's0273',
  introText031 = 's0283',
  introText032 = 's0293',
}

const check = new Set();
for (let entry of Object.entries(I18Keys)) {
  if (check.has(entry[1]))
    throw new Error(`repeated value ${entry[1]} for I18Keys key ${entry[0]}`);
  check.add(entry[1]);
}

const translationENG: Record<I18Keys, string> = {
  [I18Keys.introTitle]: 'Your ideas matter again',
  [I18Keys.introSubtitle]:
    'Transform your social media activity into meaningful scientific contributions',
  [I18Keys.introParagraph1]:
    'Social media posts are a valuable source of scientific knowledge, but they get buried in noisy feeds and locked away by platforms.',
  [I18Keys.introParagraph2]:
    'Harness this knowledge by converting your social media posts into nanopublications, making your content <b>FAIR</b> (<b>F</b>indable, <b>A</b>ccessible, <b>I</b>nteroperable and <b>R</b>eusable), so your contributions can get proper recognition',
  [I18Keys.emailInputBtn]: 'Get started',

  [I18Keys.connectSocialsTitle]: 'Connect your socials',
  [I18Keys.connectSocialsParagraph]:
    'Link your X·Twitter account to start transforming your tweets into nanopublications.',
  [I18Keys.connectSocialsParagraph2]:
    'By connecting, you can easily identify and FAIRify your valuable scientific insights.',
  [I18Keys.signInX]: 'Sign in with X',

  [I18Keys.drafts]: 'Drafts',

  [I18Keys.introNextLabel]: 'Next Tip',
  [I18Keys.introFinalLabel]: 'Let’s nanopublish!',

  [I18Keys.introHeading01]: 'We’re finding your science posts',
  [I18Keys.introText011]:
    'Our AI is scanning your latest X · Twitter posts to identify and tag your science-related content.  These tags make your posts machine-readable, enhancing their discoverability and usability. ',
  [I18Keys.introText012]:
    'The posts tagged as "For Review" are those our AI recommends for nanopublishing.',

  [I18Keys.introHeading02]: 'Nanopublish your research and recommendations ',
  [I18Keys.introText021]:
    'All your research-related posts make valuable nanopublications!',
  [I18Keys.introText022]:
    "Posts mentioning references with a DOI are perfect candidates, but don't stop there. Consider sharing research ideas, conference highlights, grant information, or job opportunities as well.",

  [I18Keys.introHeading03]: 'We’ve got you covered!',
  [I18Keys.introText031]:
    "As you continue posting on X · Twitter, we'll monitor your feed for relevant content to ensure your future research remains FAIR and under your control.",
  [I18Keys.introText032]:
    'You can adjust your notification and publishing automation settings anytime in your preferences.',

  [I18Keys.connectAccounts]: 'Connect your accounts',
  [I18Keys.connectParagraph]:
    'SenseNet loads your X (Twitter) feed and analyzes your posts using AI to deduct keywords and relations, which can be used to better interpret the meaning of your content.',
  [I18Keys.errorConnectTwitter]: 'Error connecting Twitter',
  [I18Keys.yourPublications]: 'Your publications',
  [I18Keys.TweetX]: 'X · Tweet',
  [I18Keys.ThreadX]: 'X · Thread',
  [I18Keys.addKeyword]: 'add keyword',
  [I18Keys.profile]: 'Profile',
  [I18Keys.updateAvailable]: 'An update is available, ',
  [I18Keys.updateNow]: 'update now',
  [I18Keys.installPrompt]: 'Please install this app, ',
  [I18Keys.installNow]: 'install',
  [I18Keys.noMorePosts]: 'No more posts to show',
  [I18Keys.settings]: 'Settings',
  [I18Keys.logout]: 'Logout',
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
