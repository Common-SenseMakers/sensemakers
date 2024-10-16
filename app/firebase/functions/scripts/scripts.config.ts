import dotenv from 'dotenv';

import { ServicesConfig } from '../src/instances/services';

// Load environment variables from .env file
dotenv.config({ path: './migrations/.env.migrations' });

export const config: ServicesConfig = {
  testCredentials: process.env.TEST_USER_ACCOUNTS as string,
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID as string,
    clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    bearerToken: process.env.TWITTER_BEARER_TOKEN as string,
  },
  nanopub: {
    rsaKeys: {
      publicKey: process.env.NP_PUBLISH_RSA_PUBLIC_KEY as string,
      privateKey: process.env.NP_PUBLISH_RSA_PRIVATE_KEY as string,
    },
    servers: process.env.NANOPUBS_PUBLISH_SERVERS
      ? JSON.parse(process.env.NANOPUBS_PUBLISH_SERVERS)
      : [],
  },
  mastodon: {
    accessTokens: JSON.parse(process.env.MASTODON_ACCESS_TOKENS as string),
  },
  bluesky: {
    BLUESKY_USERNAME: process.env.BLUESKY_USERNAME as string,
    BLUESKY_APP_PASSWORD: process.env.BLUESKY_APP_PASSWORD as string,
    BLUESKY_SERVICE_URL: process.env.BLUESKY_SERVICE_URL as string,
  },
  email: {
    apiKey: process.env.EMAIL_CLIENT_SECRET as string,
  },
  parser: process.env.FUNCTIONS_PY_URL as string,
  our: {
    expiresIn: '30d',
    tokenSecret: process.env.OUR_TOKEN_SECRET as string,
  },
  isEmulator: process.env.FIRESTORE_EMULATOR_HOST !== undefined,
  mock: {
    USE_REAL_BLUESKY: process.env.USE_REAL_BLUESKY === 'true',
    USE_REAL_EMAIL: process.env.USE_REAL_EMAIL === 'true',
    USE_REAL_MASTODON: process.env.USE_REAL_MASTODON === 'true',
    USE_REAL_NANOPUB: process.env.USE_REAL_NANOPUB === 'true',
    USE_REAL_PARSER: process.env.USE_REAL_PARSER === 'true',
    USE_REAL_TWITTER: process.env.USE_REAL_TWITTERX === 'true',
  },
};
