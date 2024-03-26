import { object, string } from 'yup';

export const twitterGetSignupContextSchema = object({
  callback_url: string().required(),
  type: string().oneOf(['read', 'write']).required(),
}).noUnknown(true);

export const twitterSignupDataSchema = object({
  code: string().required(),
  codeVerifier: string().required(),
  callback_url: string().required(),
}).noUnknown(true);
