import { object, string } from 'yup';

export const authCodeScheme = object({
  code: string().required(),
}).noUnknown(true);

export const verifierCodeScheme = object({
  oauth_token: string().required(),
  oauth_verifier: string().required(),
}).noUnknown(true);

export const ethDetailsScheme = object({
  ethAddress: string().required(),
  rsaPublickey: string().required(),
  ethSignature: string().required(),
  introNanopub: string().optional(),
}).noUnknown(true);
