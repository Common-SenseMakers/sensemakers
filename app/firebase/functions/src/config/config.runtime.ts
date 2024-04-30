import { envRuntime } from './typedenv.runtime';

/** Verify that all needed env variables were provided */
const mandatory: Array<keyof typeof envRuntime> = [
  'ORCID_CLIENT_ID',
  'ORCID_SECRET',
  'OUR_TOKEN_SECRET',
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET',
];

mandatory.forEach((varName) => {
  if (!envRuntime[varName]) {
    throw new Error(`${varName} undefined`);
  }
});

/** Export all independent constants used by the functions */
export const NODE_ENV = envRuntime.NODE_ENV;
export const IS_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST !== undefined;

export const ORCID_API_URL = 'https://orcid.org';
export const ORCID_CLIENT_ID = envRuntime.ORCID_CLIENT_ID;
export const ORCID_SECRET = envRuntime.ORCID_SECRET;

export const TWITTER_API_URL = 'https://api.twitter.com';

export const TWITTER_CLIENT_ID = envRuntime.TWITTER_CLIENT_ID;
export const TWITTER_CLIENT_SECRET = envRuntime.TWITTER_CLIENT_SECRET;

export const MOCK_SEMANTICS = false;

export const APP_URL =
  process.env.NODE_ENV !== 'production'
    ? 'http://127.0.0.1:3000/'
    : 'https://sensemakers.netlify.app/';

export const TWITTER_CALLBACK_URL = APP_URL;
export const TWITTER_REVOKE_URL =
  'https://twitter.com/settings/connected_apps/26368336';

export const SENSENET_DOMAIN = 'http://127.0.0.1:3000/';
export const FUNCTIONS_PY_URL =
  process.env.NODE_ENV !== 'production'
    ? 'http://127.0.0.1:5002/sensenets-9ef26/us-central1'
    : 'https://sm-function-post-parser-eeshylf4jq-uc.a.run.app/';

export const USE_REAL_PARSER = envRuntime.USE_REAL_PARSER;
export const USE_REAL_TWITTERX = envRuntime.USE_REAL_TWITTERX;
export const USE_REAL_NANOPUB = envRuntime.USE_REAL_NANOPUB;

export const OUR_TOKEN_SECRET = envRuntime.OUR_TOKEN_SECRET;
export const OUR_EXPIRES_IN = '30d';

export const NANOPUBS_PUBLISH_SERVERS = [
  'https://np.petapico.org/',
  'https://np.knowledgepixels.com/',
];
export const POSTS_JOB_SCHEDULE = 'every 2 hours';
export const FETCH_RATE_LIMIT_MS = 3 * 60 * 1000;
