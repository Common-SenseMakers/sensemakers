import { logger } from 'firebase-functions/v1';

import { ENVIRONMENTS } from './ENVIRONMENTS';
import { env } from './typedenv';

logger.debug('NODE_ENV', process.env.NODE_ENV);

/** Verify that all needed env variables were provided */
if (!env.ORCID_CLIENT_ID) throw new Error('ORCID_CLIENT_ID undefined');
if (!env.ORCID_SECRET) throw new Error('ORCID_SECRET undefined');
if (!env.TWITTER_CLIENT_ID) throw new Error('TWITTER_CLIENT_ID undefined');
if (!env.TWITTER_BEARER_TOKEN)
  throw new Error('TWITTER_BEARER_TOKEN undefined');
if (!env.TWITTER_API_KEY) throw new Error('TWITTER_API_KEY undefined');
if (!env.TWITTER_API_SECRET_KEY)
  throw new Error('TWITTER_API_SECRET_KEY undefined');

/** Export all indendent constants user by the functions */
export const NODE_ENV = env.NODE_ENV;

export const ORCID_API_URL = 'https://orcid.org';
export const ORCID_CLIENT_ID = env.ORCID_CLIENT_ID;
export const ORCID_SECRET = env.ORCID_SECRET;

export const TWITTER_API_URL = 'https://api.twitter.com';
export const TWITTER_CLIENT_ID = env.TWITTER_CLIENT_ID;
export const TWITTER_BEARER_TOKEN = env.TWITTER_BEARER_TOKEN;
export const TWITTER_API_KEY = env.TWITTER_API_KEY;
export const TWITTER_API_SECRET_KEY = env.TWITTER_API_SECRET_KEY;

export const MOCK_SEMANTICS = NODE_ENV === ENVIRONMENTS.TEST;

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

export const TOKEN_EXPIRATION = '30d';
export const NANOPUBS_SPARQL_SERVER =
  'https://query.np.trustyuri.net/repo/full';

export const REGION = 'us-central1';
