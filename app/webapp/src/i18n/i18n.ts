import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ENG: {
      translation: {
        connectedAs: 'Connected as',
        connect: 'Login',
        connectBtn: 'Login with ORCID',
        accountReady: 'Connected',
        connectNanopub: 'Connect to the Nanopub Network',
        connectNanopubBtn: 'Connect',
        nanopubConnected: 'Connected',
        connectTwitter: 'Connect to Twitter/X',
        connectTwitterBn: 'Connect',
        twitterConnected: 'Connected',
        orcid: 'orcid',
        twitter: 'twitter/X',
        nanopubSigner: 'Nanopub Signer',
        introPub: 'Intro Nanopub',
        socials: 'Socials',
        editor: 'Editor',
        userNotConnected: 'Not connected',
        postNew: 'New Post',
        publishTo: 'Publish to',
        postContent: 'Content',
        postSemantics: 'Semantics',
        writeYourPost: 'Your post...',
        reset: 'reset',
        refresh: 'refresh',
        process: 'process',
        publish: 'publish',
        postSent: 'Post succesfully created!',
        viewPost: 'Open Tweet',
        nanopub: 'Open nanopublication',
        twitterNotConnected: 'Not Connected',
        nanopubsNotConnected: 'Not Connected',
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
