import {
  defineBoolean,
  defineSecret,
  defineString,
} from 'firebase-functions/params';

const PROJECT_ID = defineString('PROJECT_ID');
const APP_URL = defineString('APP_URL');

const TWITTER_CALLBACK_URL = defineString('TWITTER_CALLBACK_URL');
const TWITTER_REVOKE_URL = defineString('TWITTER_REVOKE_URL');
const FUNCTIONS_PY_URL = defineString('FUNCTIONS_PY_URL');
const NANOPUBS_PUBLISH_SERVERS = defineString('NANOPUBS_PUBLISH_SERVERS');
const FETCH_RATE_LIMIT_MS = defineString('FETCH_RATE_LIMIT_MS');

const ORCID_CLIENT_ID = defineString('ORCID_CLIENT_ID');
const TWITTER_CLIENT_ID = defineString('TWITTER_CLIENT_ID');
const NP_PUBLISH_RSA_PUBLIC_KEY = defineString('NP_PUBLISH_RSA_PUBLIC_KEY');

const EMAIL_SENDER_FROM = defineString('EMAIL_SENDER_FROM');
const ADMIN_EMAIL = defineString('ADMIN_EMAIL');

const USE_REAL_PARSER = defineBoolean('USE_REAL_PARSER');
const USE_REAL_TWITTERX = defineBoolean('USE_REAL_TWITTERX');
const USE_REAL_MASTODON = defineBoolean('USE_REAL_MASTODON');
const USE_REAL_BLUESKY = defineBoolean('USE_REAL_BLUESKY');
const USE_REAL_NANOPUB = defineBoolean('USE_REAL_NANOPUB');
const USE_REAL_EMAIL = defineBoolean('USE_REAL_EMAIL');
const TEST_USER_ACCOUNTS = defineString('TEST_USER_ACCOUNTS');

const LOG_LEVEL_MSG = defineString('LOG_LEVEL_MSG');
const LOG_LEVEL_OBJ = defineString('LOG_LEVEL_OBJ');

const ORCID_SECRET = defineSecret('ORCID_SECRET');
const OUR_TOKEN_SECRET = defineSecret('OUR_TOKEN_SECRET');
const TWITTER_CLIENT_SECRET = defineSecret('TWITTER_CLIENT_SECRET');
const TWITTER_BEARER_TOKEN = defineSecret('TWITTER_BEARER_TOKEN');
const MASTODON_ACCESS_TOKEN = defineSecret('MASTODON_ACCESS_TOKEN');
const EMAIL_CLIENT_SECRET = defineSecret('EMAIL_CLIENT_SECRET');
const MAGIC_ADMIN_SECRET = defineSecret('MAGIC_ADMIN_SECRET');

const NP_PUBLISH_RSA_PRIVATE_KEY = defineSecret('NP_PUBLISH_RSA_PRIVATE_KEY');
const ADMIN_API_KEY = defineSecret('ADMIN_API_KEY');

export const envRuntime = {
  NODE_ENV: process.env.NODE_ENV,
  REGION: process.env.FUNCTION_REGION,
  LOG_LEVEL_MSG: LOG_LEVEL_MSG,
  LOG_LEVEL_OBJ: LOG_LEVEL_OBJ,
  PROJECT_ID: PROJECT_ID,
  APP_URL: APP_URL,
  TWITTER_CALLBACK_URL: TWITTER_CALLBACK_URL,
  TWITTER_REVOKE_URL: TWITTER_REVOKE_URL,
  FUNCTIONS_PY_URL: FUNCTIONS_PY_URL,
  FETCH_RATE_LIMIT_MS: FETCH_RATE_LIMIT_MS,
  ORCID_CLIENT_ID: ORCID_CLIENT_ID,
  ORCID_SECRET: ORCID_SECRET,
  OUR_TOKEN_SECRET: OUR_TOKEN_SECRET,
  EMAIL_SENDER_FROM: EMAIL_SENDER_FROM,
  ADMIN_EMAIL: ADMIN_EMAIL,
  TWITTER_CLIENT_ID: TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET: TWITTER_CLIENT_SECRET,
  TWITTER_BEARER_TOKEN: TWITTER_BEARER_TOKEN,
  MASTODON_ACCESS_TOKEN: MASTODON_ACCESS_TOKEN,
  USE_REAL_PARSER: USE_REAL_PARSER,
  USE_REAL_TWITTERX: USE_REAL_TWITTERX,
  USE_REAL_MASTODON: USE_REAL_MASTODON,
  USE_REAL_BLUESKY: USE_REAL_BLUESKY,
  USE_REAL_NANOPUB: USE_REAL_NANOPUB,
  USE_REAL_EMAIL: USE_REAL_EMAIL,
  TEST_USER_ACCOUNTS: TEST_USER_ACCOUNTS,
  NANOPUBS_PUBLISH_SERVERS: NANOPUBS_PUBLISH_SERVERS,
  NP_PUBLISH_RSA_PRIVATE_KEY: NP_PUBLISH_RSA_PRIVATE_KEY,
  NP_PUBLISH_RSA_PUBLIC_KEY: NP_PUBLISH_RSA_PUBLIC_KEY,
  EMAIL_CLIENT_SECRET: EMAIL_CLIENT_SECRET,
  MAGIC_ADMIN_SECRET: MAGIC_ADMIN_SECRET,
  ADMIN_API_KEY: ADMIN_API_KEY,
};
