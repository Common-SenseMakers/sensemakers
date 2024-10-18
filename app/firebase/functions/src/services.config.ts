import {
  BLUESKY_APP_PASSWORD,
  BLUESKY_SERVICE_URL,
  BLUESKY_USERNAME,
  FUNCTIONS_PY_URL,
  MASTODON_ACCESS_TOKENS,
  OUR_TOKEN_SECRET,
  TEST_USER_ACCOUNTS,
  TWITTER_BEARER_TOKEN,
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  USE_REAL_BLUESKY,
  USE_REAL_EMAIL,
  USE_REAL_MASTODON,
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTERX,
} from './config/config.runtime';
import { ServicesConfig } from './instances/services';

export const getConfig = (): ServicesConfig => {
  return {
    isEmulator: process.env.FIRESTORE_EMULATOR_HOST !== undefined,
    testCredentials: TEST_USER_ACCOUNTS.value(),
    twitter: {
      clientId: TWITTER_CLIENT_ID.value(),
      clientSecret: TWITTER_CLIENT_SECRET.value(),
      bearerToken: TWITTER_BEARER_TOKEN.value(),
    },
    mastodon: {
      accessTokens: JSON.parse(MASTODON_ACCESS_TOKENS.value()),
    },
    bluesky: {
      BLUESKY_USERNAME: BLUESKY_USERNAME.value(),
      BLUESKY_APP_PASSWORD: BLUESKY_APP_PASSWORD.value(),
      BLUESKY_SERVICE_URL: BLUESKY_SERVICE_URL,
    },
    parser: FUNCTIONS_PY_URL.value(),
    our: {
      expiresIn: '30d',
      tokenSecret: OUR_TOKEN_SECRET.value(),
    },
    mock: {
      USE_REAL_BLUESKY: USE_REAL_BLUESKY.value(),
      USE_REAL_EMAIL: USE_REAL_EMAIL.value(),
      USE_REAL_MASTODON: USE_REAL_MASTODON.value(),
      USE_REAL_NANOPUB: USE_REAL_NANOPUB.value(),
      USE_REAL_PARSER: USE_REAL_PARSER.value(),
      USE_REAL_TWITTER: USE_REAL_TWITTERX.value(),
    },
  };
};
