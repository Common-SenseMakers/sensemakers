import { NanopubUserDetails } from './types.nanopubs';
import { OrcidUserDetails } from './types.orcid';
import { TwitterUserDetails } from './types.twitter';

export enum PLATFORM {
  Local = 'local', // local referst to out platform
  Orcid = 'orcid',
  Twitter = 'twitter',
  Nanopub = 'nanopub',
}

export type PUBLISHABLE_PLATFORMS = PLATFORM.Twitter | PLATFORM.Nanopub;

export const ALL_PUBLISH_PLATFORMS: PUBLISHABLE_PLATFORMS[] = [
  PLATFORM.Twitter,
  PLATFORM.Nanopub,
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

export interface UserDetailsBase<P = any, R = any, W = any>
  extends WithPlatformUserId {
  profile?: P;
  read?: R & { lastFetchedMs: number };
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
  platformIds: string[]; // redundant array with the prefixed user_id of all the authenticated platforms for a given user
}

/**
 * AppUser is the entire User object (include credentials) and MUST be
 * kept inside the backend, never sent to the user. We use AppUserRead
 * to send the user profiles to the frontend.
 */
export interface AppUser extends UserWithId {
  [PLATFORM.Orcid]?: OrcidUserDetails[];
  [PLATFORM.Twitter]?: TwitterUserDetails[];
  [PLATFORM.Nanopub]?: NanopubUserDetails[];
}

export type AppUserCreate = Omit<AppUser, 'userId'>;

/**
 * The AppUserRead replaces the details with read details (keeps the profile and users
 * boolean flags for the read and write properties)
 */
export interface AppUserRead extends UserWithId {
  [PLATFORM.Orcid]?: UserDetailsReadBase<OrcidUserDetails['profile']>[];
  [PLATFORM.Twitter]?: UserDetailsReadBase<TwitterUserDetails['profile']>[];
  [PLATFORM.Nanopub]?: UserDetailsReadBase<NanopubUserDetails['profile']>[];
}

/** Support types */
export type DefinedIfTrue<V, R> = V extends true ? R : R | undefined;

export type HexStr = `0x${string}`;

export interface OurTokenConfig {
  tokenSecret: string;
  expiresIn: string;
}

export interface HandleSignupResult {
  userId: string;
  ourAccessToken?: string;
}
