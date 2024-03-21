import { object, string } from 'yup';

export const twitterGetSignupContextSchema = object({
  type: string().oneOf(['authenticate', 'authorize']).required(),
}).noUnknown(true);

export const twitterSignupDataSchema = object({
  oauth_token: string().required(),
  oauth_token_secret: string().required(),
  oauth_verifier: string().required(),
}).noUnknown(true);
