export const DEBUG = true;

export const FUNCTIONS_BASE = process.env.FUNCTIONS_BASE;

export const ORCID_CLIENT_ID = process.env.ORCID_CLIENT_ID;
export const ORCID_API_URL = 'https://orcid.org';
export const APP_URL =
  process.env.NODE_ENV !== 'production'
    ? 'http://127.0.0.1:3000/'
    : 'https://sensemakers.netlify.app/';

export const ORCID_REDIRECT_URL = APP_URL;

export const TWITTER_API_URL = 'https://api.twitter.com';
export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;

export const WALLETCONNECT_PROJECT_ID = 'c12fdc701fd336cf8dc059f6784906bc';
export const MAGIC_API_KEY = 'pk_live_A603B0287DAF3C97';

export const NANOPUBS_SERVER = 'https://np.petapico.org/';

export const THIS_POST_NAME = 'http://sensentes/ThisText';
