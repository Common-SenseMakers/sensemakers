import { object, string } from 'yup';

export const twitterGetSignupContextSchema = object({
  callback_url: string().required(),
  type: string().oneOf(['read', 'write']).required(),
}).noUnknown(true);

export const nanopubGetSignupContextSchema = object({
  rsaPublickey: string().required(),
  ethAddress: string().required(),
  ethToRsaSignature: string().required(),
}).noUnknown(true);

export const twitterSignupDataSchema = object({
  code: string().required(),
  codeVerifier: string().required(),
  callback_url: string().required(),
}).noUnknown(true);

export const nanopubSignupDataSchema = object({
  rsaPublickey: string().required(),
  ethAddress: string().required(),
  ethToRsaSignature: string().required(),
  introNanopub: string().required(),
}).noUnknown(true);

export const mirrorPostSchema = object({
  id: string().required(),
  content: string().required(),
  semantics: string().required(),
}).noUnknown(true);