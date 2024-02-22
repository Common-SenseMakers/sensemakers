import { ENVIRONMENTS } from './ENVIRONMENTS';

export interface Env {
  environment: ENVIRONMENTS;
  ORCID_CLIENT_ID: string;
  ORCID_SECRET: string;
  TOKEN_SECRET: string;
  TWITTER_API_KEY: string;
  TWITTER_API_SECRET_KEY: string;
  TWITTER_CLIENT_ID: string;
  TWITTER_CLIENT_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
}
