import { object, string } from 'yup';

import { NotificationFreq } from '../../@shared/types/types.notifications';
import { AutopostOption, PLATFORM } from '../../@shared/types/types.user';

export const twitterGetSignupContextSchema = object({
  callback_url: string().required(),
  type: string().oneOf(['read', 'write']).required(),
}).noUnknown(true);

export const nanopubGetSignupContextSchema = object({
  rsaPublickey: string().required(),
  ethAddress: string().required(),
  ethToRsaSignature: string().required(),
}).noUnknown(true);

export const orcidGetSignupContextSchema = object({}).noUnknown(true);

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

export const orcidSignupDataSchema = object({
  code: string().required(),
}).noUnknown(true);

export const userSettingsUpdateSchema = object({
  autopost: object({
    [PLATFORM.Nanopub]: object({
      value: string()
        .oneOf([...Object.values(AutopostOption)])
        .required(),
    }),
  })
    .optional()
    .default(undefined),
  notificationFreq: string()
    .oneOf([...Object.values(NotificationFreq)])
    .optional(),
}).noUnknown(true);

export const magicEmailSetSchema = object({
  idToken: string().required(),
}).noUnknown(true);
