import { defineSecret, defineString } from 'firebase-functions/params';

const ORCID_CLIENT_ID = defineString('ORCID_CLIENT_ID');
const TWITTER_CLIENT_ID = defineString('TWITTER_CLIENT_ID');

const ORCID_SECRET = defineSecret('ORCID_SECRET');
const OUR_TOKEN_SECRET = defineSecret('OUR_TOKEN_SECRET');
const TWITTER_CLIENT_SECRET = defineSecret('TWITTER_CLIENT_SECRET');

export const envRuntime = {
  NODE_ENV: process.env.NODE_ENV,
  ORCID_CLIENT_ID: ORCID_CLIENT_ID,
  ORCID_SECRET: ORCID_SECRET,
  OUR_TOKEN_SECRET: OUR_TOKEN_SECRET,
  TWITTER_CLIENT_ID: TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET: TWITTER_CLIENT_SECRET,
};
