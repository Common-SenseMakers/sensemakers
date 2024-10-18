import { NotificationFreq } from '../@shared/types/types.notifications';
import { PLATFORM } from '../@shared/types/types.platforms';
import { AutopostOption, UserSettings } from '../@shared/types/types.user';
import { envRuntime } from './typedenv.runtime';

/** Verify that all needed env variables were provided */
const mandatory: Array<keyof typeof envRuntime> = [
  'ORCID_CLIENT_ID',
  'ORCID_SECRET',
  'OUR_TOKEN_SECRET',
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET',
  'TWITTER_BEARER_TOKEN',
  'MASTODON_ACCESS_TOKENS',
  'BLUESKY_APP_PASSWORD',
  'BLUESKY_USERNAME',
  'BLUESKY_SERVICE_URL',
  'PROJECT_ID',
  'NANOPUBS_PUBLISH_SERVERS',
  'NP_PUBLISH_RSA_PRIVATE_KEY',
  'NP_PUBLISH_RSA_PUBLIC_KEY',
  'EMAIL_CLIENT_SECRET',
  'ADMIN_API_KEY',
];

mandatory.forEach((varName) => {
  if (!envRuntime[varName]) {
    throw new Error(`${varName} undefined`);
  }
});

/** Export all independent constants used by the functions */
export const NODE_ENV = envRuntime.NODE_ENV;
export const PROJECT_ID = envRuntime.PROJECT_ID;
export const APP_URL = envRuntime.APP_URL;

export const IS_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST !== undefined;

export const ORCID_API_URL = 'https://orcid.org';
export const ORCID_CLIENT_ID = envRuntime.ORCID_CLIENT_ID;
export const ORCID_SECRET = envRuntime.ORCID_SECRET;

export const TWITTER_API_URL = 'https://api.twitter.com';

export const TWITTER_CLIENT_ID = envRuntime.TWITTER_CLIENT_ID;
export const TWITTER_CLIENT_SECRET = envRuntime.TWITTER_CLIENT_SECRET;
export const TWITTER_BEARER_TOKEN = envRuntime.TWITTER_BEARER_TOKEN;

export const MASTODON_ACCESS_TOKENS = envRuntime.MASTODON_ACCESS_TOKENS;

export const BLUESKY_APP_PASSWORD = envRuntime.BLUESKY_APP_PASSWORD;
export const BLUESKY_USERNAME = envRuntime.BLUESKY_USERNAME;
export const BLUESKY_SERVICE_URL = 'https://bsky.social';

export const ADMIN_API_KEY = envRuntime.ADMIN_API_KEY;

export const TWITTER_CALLBACK_URL = envRuntime.TWITTER_CALLBACK_URL;
export const TWITTER_REVOKE_URL = envRuntime.TWITTER_REVOKE_URL;

export const FUNCTIONS_PY_URL = envRuntime.FUNCTIONS_PY_URL;

export const USE_REAL_PARSER = envRuntime.USE_REAL_PARSER;
export const USE_REAL_TWITTERX = envRuntime.USE_REAL_TWITTERX;
export const USE_REAL_MASTODON = envRuntime.USE_REAL_MASTODON;
export const USE_REAL_BLUESKY = envRuntime.USE_REAL_BLUESKY;
export const USE_REAL_NANOPUB = envRuntime.USE_REAL_NANOPUB;
export const USE_REAL_EMAIL = envRuntime.USE_REAL_EMAIL;

export const TEST_USER_ACCOUNTS = envRuntime.TEST_USER_ACCOUNTS;

export const PARSING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const OUR_TOKEN_SECRET = envRuntime.OUR_TOKEN_SECRET;
export const OUR_EXPIRES_IN = '30d';

export const EMAIL_SENDER_FROM = envRuntime.EMAIL_SENDER_FROM;
export const ADMIN_EMAIL = envRuntime.ADMIN_EMAIL;

export const NANOPUBS_PUBLISH_SERVERS_STR = envRuntime.NANOPUBS_PUBLISH_SERVERS;

export const QUIET_SIGNUP_PERIOD = 5 * 60 * 1000; // 5 minutes
export const AUTOFETCH_PERIOD = 'every 30 minutes';

export const DAILY_NOTIFICATION_PERIOD = 'every day 18:00';
export const WEEKLY_NOTIFICATION_PERIOD = 'every monday 18:00';
export const MONTHLY_NOTIFICATION_PERIOD = '0 0 1 * *';
export const FETCH_RATE_LIMIT_MS = envRuntime.FETCH_RATE_LIMIT_MS;

export const NP_PUBLISH_RSA_PRIVATE_KEY = envRuntime.NP_PUBLISH_RSA_PRIVATE_KEY;
export const NP_PUBLISH_RSA_PUBLIC_KEY = envRuntime.NP_PUBLISH_RSA_PUBLIC_KEY;
export const NANOPUBS_PUBLISH_SERVERS = envRuntime.NANOPUBS_PUBLISH_SERVERS;

export const EMAIL_CLIENT_SECRET = envRuntime.EMAIL_CLIENT_SECRET;
export const MAGIC_ADMIN_SECRET = envRuntime.MAGIC_ADMIN_SECRET;

export const USER_INIT_SETTINGS: UserSettings = {
  autopost: { [PLATFORM.Nanopub]: { value: AutopostOption.MANUAL } },
  notificationFreq: NotificationFreq.Daily,
};
