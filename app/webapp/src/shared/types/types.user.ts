import {
  BlueskyAccountDetails,
  BlueskySigninCredentials,
} from './types.bluesky';
import {
  MastodonAccountDetails,
  MastodonSigninCredentials,
} from './types.mastodon';
import { NanopubSigninCredentials } from './types.nanopubs';
import { NotificationFreq } from './types.notifications';
import { OrcidAccountDetails, OrcidProfile } from './types.orcid';
import { IDENTITY_PLATFORM, PLATFORM } from './types.platforms';
import { AppPostFull } from './types.posts';
import {
  AccountProfileRead,
  PlatformProfile,
  WithPlatformUserId,
} from './types.profiles';
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
  isDisconnected?: boolean;
}

/** The AppUser object combines the details of each platform */
export interface UserWithId {
  clerkId: string;
  userId: string;
}

export interface UserWithDetails {
  details?: {
    onboarded: boolean;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserSettings {}

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
  [PLATFORM.Mastodon]?: MastodonAccountDetails[];
  [PLATFORM.Bluesky]?: BlueskyAccountDetails[];
}

export interface UserWithAccounts {
  accounts: UserAccounts;
  accountsIds: string[]; // redundant, used to index users with accounts
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
    UserWithAccounts,
    UserWithDetails {}

export type AppUserCreate = Omit<AppUser, 'userId' | 'accountsIds'>;

/**
 * The AccountDetailsRead combines the AccountDetails (signup date and credentials
 * existence) with the account profile
 */
export interface AccountDetailsRead<
  P extends PlatformProfile = PlatformProfile,
> {
  platformId: IDENTITY_PLATFORM;
  user_id: string;
  profile: P;
  read: boolean;
  write: boolean;
  isDisconnected?: boolean;
}

/** accounts include the readable details (not sensitive details) */

/** details sent to the logged in user about themeselves */
export interface AppUserRead
  extends UserWithId,
    UserWithSettings,
    UserWithDetails {
  profiles: {
    [PLATFORM.Orcid]?: AccountDetailsRead<OrcidProfile>[];
    [PLATFORM.Twitter]?: AccountDetailsRead<PlatformProfile>[];
    [PLATFORM.Mastodon]?: AccountDetailsRead<PlatformProfile>[];
    [PLATFORM.Bluesky]?: AccountDetailsRead<PlatformProfile>[];
  };
}

/** details publicly available about a user */
export interface AppUserPublicRead extends Omit<UserWithId, 'clerkId'> {
  profiles: {
    [PLATFORM.Orcid]?: AccountProfileRead[];
    [PLATFORM.Twitter]?: AccountProfileRead[];
    [PLATFORM.Mastodon]?: AccountProfileRead[];
    [PLATFORM.Bluesky]?: AccountProfileRead[];
  };
}

/** Test users support for mocks and tests */
export interface TestUserCredentials {
  userId: string;
  clerkId: string;
  clustersIds: string[];
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
