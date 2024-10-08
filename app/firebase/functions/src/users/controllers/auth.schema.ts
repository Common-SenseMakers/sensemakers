import { object, string } from 'yup';

import { NotificationFreq } from '../../@shared/types/types.notifications';
import { PLATFORM } from '../../@shared/types/types.platforms';
import { AutopostOption } from '../../@shared/types/types.user';

export const mastodonGetSignupContextSchema = object({
  mastodonServer: string().required(),
  callback_url: string().required(),
  type: string().oneOf(['read', 'write']).required(),
}).noUnknown(true);

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
  introNanopubSigned: string().required(),
}).noUnknown(true);

export const orcidSignupDataSchema = object({
  code: string().required(),
  callbackUrl: string().required(),
}).noUnknown(true);

export const mastodonSignupDataSchema = object({
  code: string().required(),
  mastodonServer: string().required(),
  callback_url: string().required(),
  type: string().oneOf(['read', 'write']).required(),
  clientId: string().required(),
  clientSecret: string().required(),
}).noUnknown(true);

export const blueskySignupDataSchema = object({
  username: string().required(),
  appPassword: string().required(),
  type: string().oneOf(['read', 'write']).required(),
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
