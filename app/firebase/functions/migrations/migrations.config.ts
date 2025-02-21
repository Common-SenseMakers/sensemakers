import dotenv from 'dotenv';

import { ServicesConfig } from '../src/instances/services';

// Load environment variables from .env file
dotenv.config({ path: './migrations/.env.migrations' });

export const config: ServicesConfig = {
  links: {
    apiUrl: process.env.IFRAMELY_API_URL as string,
    apiKey: process.env.IFRAMELY_API_KEY as string,
  },
  testCredentials: process.env.TEST_USER_ACCOUNTS as string,
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID as string,
    clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    bearerToken: process.env.TWITTER_BEARER_TOKEN as string,
  },
  mastodon: {
    accessTokens: JSON.parse(process.env.MASTODON_ACCESS_TOKENS as string),
  },
  bluesky: {
    BLUESKY_USERNAME: process.env.BLUESKY_USERNAME as string,
    BLUESKY_APP_PASSWORD: process.env.BLUESKY_APP_PASSWORD as string,
    BLUESKY_SERVICE_URL: process.env.BLUESKY_SERVICE_URL as string,
  },
  parser: process.env.FUNCTIONS_PY_URL as string,
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY as string,
    secretKey: process.env.CLERK_SECRET_KEY as string,
  },
  isEmulator: process.env.FIRESTORE_EMULATOR_HOST !== undefined,
  mock: {
    USE_REAL_BLUESKY: process.env.USE_REAL_BLUESKY === 'true',
    USE_REAL_EMAIL: process.env.USE_REAL_EMAIL === 'true',
    USE_REAL_MASTODON: process.env.USE_REAL_MASTODON === 'true',
    USE_REAL_NANOPUB: process.env.USE_REAL_NANOPUB === 'true',
    USE_REAL_PARSER: process.env.USE_REAL_PARSER === 'true',
    USE_REAL_TWITTER: process.env.USE_REAL_TWITTERX === 'true',
    USE_REAL_LINKS: process.env.USE_REAL_LINKS === 'true',
    USE_REAL_TASKS: process.env.USE_REAL_TASKS === 'true',
  },
};
