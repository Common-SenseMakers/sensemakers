import { envRuntime } from './typedenv.runtime';

/** Verify that all needed env variables were provided */
const mandatory: Array<keyof typeof envRuntime> = [
  'ORCID_CLIENT_ID',
  'ORCID_SECRET',
  'OUR_TOKEN_SECRET',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET_KEY',
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET',
  'TWITTER_BEARER_TOKEN',
];

mandatory.forEach((varName) => {
  if (!envRuntime[varName]) {
    throw new Error(`${varName} undefined`);
  }
});

/** Export all independent constants used by the functions */
export const NODE_ENV = envRuntime.NODE_ENV;

export const ORCID_API_URL = 'https://orcid.org';
export const ORCID_CLIENT_ID = envRuntime.ORCID_CLIENT_ID;
export const ORCID_SECRET = envRuntime.ORCID_SECRET;

export const TWITTER_API_URL = 'https://api.twitter.com';

export const TWITTER_CLIENT_ID = envRuntime.TWITTER_CLIENT_ID;
export const TWITTER_CLIENT_SECRET = envRuntime.TWITTER_CLIENT_SECRET;

export const TWITTER_BEARER_TOKEN = envRuntime.TWITTER_BEARER_TOKEN;

export const TWITTER_API_KEY = envRuntime.TWITTER_API_KEY;
export const TWITTER_API_SECRET_KEY = envRuntime.TWITTER_API_SECRET_KEY;

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

export const OUR_TOKEN_SECRET = envRuntime.OUR_TOKEN_SECRET;
export const TOKEN_EXPIRATION = '30d';

export const NANOPUBS_SPARQL_SERVER =
  'https://query.np.trustyuri.net/repo/full';
