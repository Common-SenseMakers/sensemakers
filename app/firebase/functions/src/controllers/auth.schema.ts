import { object, string } from 'yup';

export const twitterSignupDataSchema = object({
  signup_token: string().required(),
  oauth_token: string().required(),
  oauth_verifier: string().required(),
}).noUnknown(true);
