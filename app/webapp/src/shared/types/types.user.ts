import {
  BlueskyAccountDetails,
  BlueskySigninCredentials,
} from './types.bluesky';
import {
  MastodonAccountDetails,
  MastodonSigninCredentials,
} from './types.mastodon';
import {
  NanopubAccountDetails,
  NanopubProfile,
  NanopubSigninCredentials,
} from './types.nanopubs';
import { NotificationFreq } from './types.notifications';
import { OrcidAccountDetails, OrcidProfile } from './types.orcid';
import { PLATFORM } from './types.platforms';
import { AppPostFull } from './types.posts';
import { PlatformProfile, WithPlatformUserId } from './types.profiles';
import {
  TwitterAccountDetails,
  TwitterSigninCredentials,
} from './types.twitter';

/** Support types */
export type DefinedIfTrue<V, R> = V extends true ? R : R | undefined;

export type HexStr = `0x${string}`;

export const toHexStr = (str: string): HexStr => {
  if (str.startsWith('0x')) {
    return str as HexStr;
  } else {
    throw new Error(`Invalid HexStr ${str}`);
  }
};

/** user types */
export interface AccountCredentials<R = any, W = any> {
  read?: R;
  write?: W;
}

/**
 * AccountDetails exist for signedup users,
 * non signed up users have only AccountProfile
 * */
export interface AccountDetailsBase<
  C extends { read?: any; write?: any } = { read?: any; write?: any },
> extends WithPlatformUserId {
  signupDate: number;
  credentials: C;
}

/** The AppUser object combines the details of each platform */
export interface UserWithId {
  userId: string;
}

export enum AutopostOption {
  MANUAL = 'MANUAL',
  DETERMINISTIC = 'DETERMINISTIC',
  AI = 'AI',
}

export interface UserSettings {
  autopost: {
    [PLATFORM.Nanopub]: {
      value: AutopostOption;
      after?: number;
    };
  };
  notificationFreq: NotificationFreq;
}

export type UserSettingsUpdate = Partial<UserSettings>;

export interface EmailDetails {
  email: string;
  source: 'MAGIC';
}

export interface UserWithSettings {
  settings: UserSettings;
  email?: EmailDetails;
  signupDate: number;
}

export interface UserAccounts {
  [PLATFORM.Orcid]?: OrcidAccountDetails[];
  [PLATFORM.Twitter]?: TwitterAccountDetails[];
  [PLATFORM.Nanopub]?: NanopubAccountDetails[];
  [PLATFORM.Mastodon]?: MastodonAccountDetails[];
  [PLATFORM.Bluesky]?: BlueskyAccountDetails[];
}

export interface UserWithAccounts {
  accounts: UserAccounts;
}

/**
 * AppUser is the entire User object (include credentials) and MUST be
 * kept inside the backend, never sent to the user. We use AppUserRead
 * to send the user profiles to the frontend.
 */
export interface AppUser
  extends UserWithId,
    UserWithId,
    UserWithSettings,
    UserWithAccounts {}

export type AppUserCreate = Omit<AppUser, 'userId'>;

/**
 * The AccountDetailsRead combines the AccountDetails (signup date and credentials
 * existence) with the account profile
 */
export interface AccountDetailsRead<P = any> {
  user_id: string;
  profile: P;
  read: boolean;
  write: boolean;
}

/** accounts include the readable details (not sensitive details) */
export interface AppUserRead extends UserWithId, UserWithSettings {
  profiles: {
    [PLATFORM.Orcid]?: AccountDetailsRead<OrcidProfile>[];
    [PLATFORM.Twitter]?: AccountDetailsRead<PlatformProfile>[];
    [PLATFORM.Nanopub]?: AccountDetailsRead<NanopubProfile>[];
    [PLATFORM.Mastodon]?: AccountDetailsRead<PlatformProfile>[];
    [PLATFORM.Bluesky]?: AccountDetailsRead<PlatformProfile>[];
  };
}

/** Test users support for mocks and tests */
export interface TestUserCredentials {
  userId: string;
  twitter: TwitterSigninCredentials;
  mastodon: MastodonSigninCredentials;
  bluesky: BlueskySigninCredentials;
  nanopub: NanopubSigninCredentials;
}

export interface OrcidAccountCredentials {
  username: string;
  password: string;
}

export interface NanopubAccountCredentials {
  ethPrivateKey: HexStr;
}

export type RenderEmailFunction = (
  posts: AppPostFull[],
  notificationFrequency: NotificationFreq,
  appUrl: string
) => { html: string; plainText: string; subject: string };
