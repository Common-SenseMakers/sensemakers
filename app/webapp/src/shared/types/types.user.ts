import { MastodonUserDetails } from './types.mastodon';
import { NanopubUserDetails } from './types.nanopubs';
import { NotificationFreq } from './types.notifications';
import { OrcidUserDetails } from './types.orcid';
import { AppPostFull } from './types.posts';
import { TwitterUserDetails } from './types.twitter';

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

export enum PLATFORM {
  Local = 'local', // local referst to out platform
  Orcid = 'orcid',
  Twitter = 'twitter',
  Nanopub = 'nanopub',
  Mastodon = 'mastodon',
}

export type PUBLISHABLE_PLATFORM =
  | PLATFORM.Twitter
  | PLATFORM.Nanopub
  | PLATFORM.Mastodon;

export const ALL_PUBLISH_PLATFORMS: PUBLISHABLE_PLATFORM[] = [
  PLATFORM.Twitter,
  PLATFORM.Nanopub,
  PLATFORM.Mastodon,
];

export type IDENTITY_PLATFORM =
  | PLATFORM.Orcid
  | PLATFORM.Twitter
  | PLATFORM.Nanopub
  | PLATFORM.Mastodon;

export const ALL_IDENTITY_PLATFORMS: IDENTITY_PLATFORM[] = [
  PLATFORM.Twitter,
  PLATFORM.Nanopub,
  PLATFORM.Orcid,
  PLATFORM.Mastodon,
];

/** The user details has, for each PLATFORM, a details object
 * with
 * - user_id: the unique user id on that platform
 * - profile: metadata of the user on that platform (handle, avatar, etc)
 * - read: credentials or other data needed for reading the posts from that user
 * - write: credentials or other data needed for creating new posts in the name of the user
 */

export interface WithPlatformUserId {
  /** We are using user_id to refer the id of the user on a given platform and leave
   * userId for our own internal id for users. */
  user_id: string;
  signupDate: number;
}

export interface FetchedDetails {
  newest_id?: string;
  oldest_id?: string;
}

export interface UserDetailsBase<P = any, R = any, W = any>
  extends WithPlatformUserId {
  fetched?: FetchedDetails;
  profile?: P;
  read?: R;
  write?: W;
}

export interface UserDetailsReadBase<P> extends WithPlatformUserId {
  profile?: P;
  read: boolean;
  write: boolean;
}

/** The AppUser object combines the details of each platform */
export interface UserWithId {
  userId: string;
}

export interface UserWithPlatformIds {
  platformIds: string[]; // redundant array with the prefixed user_id of all the authenticated platforms for a given user
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

/**
 * AppUser is the entire User object (include credentials) and MUST be
 * kept inside the backend, never sent to the user. We use AppUserRead
 * to send the user profiles to the frontend.
 */
export interface AppUser
  extends UserWithId,
    UserWithPlatformIds,
    UserWithSettings {
  [PLATFORM.Orcid]?: OrcidUserDetails[];
  [PLATFORM.Twitter]?: TwitterUserDetails[];
  [PLATFORM.Nanopub]?: NanopubUserDetails[];
  [PLATFORM.Mastodon]?: MastodonUserDetails[];
}

export type AppUserCreate = Omit<AppUser, 'userId'>;

/**
 * The AppUserRead replaces the details with read details (keeps the profile)
 */

export interface AccountDetailsRead<P> {
  user_id: string;
  profile: P;
  read: boolean;
  write: boolean;
}

export interface AppUserRead extends UserWithId, UserWithSettings {
  [PLATFORM.Orcid]?: AccountDetailsRead<OrcidUserDetails['profile']>[];
  [PLATFORM.Twitter]?: AccountDetailsRead<TwitterUserDetails['profile']>[];
  [PLATFORM.Nanopub]?: AccountDetailsRead<NanopubUserDetails['profile']>[];
  [PLATFORM.Mastodon]?: AccountDetailsRead<MastodonUserDetails['profile']>[];
}

/** Support collection with all the profiles from all platforms */
export interface UserPlatformProfile {
  userId: string;
  platformId: string;
  user_id: string;
  profile: any;
}

/** Test users support for mocks and tests */
export interface TestUserCredentials {
  userId: string;
  twitter: TwitterAccountCredentials;
  mastodon: MastodonAccountCredentials;
  nanopub: NanopubAccountCredentials;
}

export interface MastodonAccountCredentials {
  id: string;
  username: string;
  displayName: string;
  mastodonServer: string;
  accessToken: string;
  type: 'read' | 'write';
}

export interface TwitterAccountCredentials {
  id: string;
  username: string;
  password: string;
  type: 'read' | 'write';
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
