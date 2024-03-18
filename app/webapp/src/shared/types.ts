import { Nanopub } from '@nanopub/sign';
import { TweetV2PostTweetResult } from 'twitter-api-v2';

import { NanopubUserDetails } from './types.nanopubs';
import { OrcidSignupData, OrcidUserDetails } from './types.orcid';
import { AppPostSemantics, ParserResult } from './types.parser';
import {
  TweetRead,
  TwitterSignupData,
  TwitterUserDetails,
} from './types.twitter';

export enum PLATFORM {
  Orcid = 'orcid',
  Twitter = 'twitter',
  Nanopubs = 'nanopubs',
}

/** The user details has, for each PLATFORM, a details object
 * with
 * - user_id: the unique user id on that platform
 * - context: data needed for signing up that had to be remembered in a multiple-step sigup process
 * - profile: metadata of the user on that platform (handle, avatar, etc)
 * - read: credentials or other data needed for reading the posts from that user
 * - write: credentials or other data needed for creating new posts in the name of the user
 */

interface PlatformUserId {
  user_id: string;
}

export interface UserDetailsBase<C, P, R, W> extends PlatformUserId {
  context?: C;
  profile?: P;
  read?: R;
  write?: W;
}

export interface UserDetailsReadBase<P> extends PlatformUserId {
  profile?: P;
  read: boolean;
  write: boolean;
}

/** The AppUser object combines the details of each platform */
interface UserWithId {
  userId: string;
}

/**
 * AppUser is the entire User object (include credentials) and MUST be
 * kept inside the backend, never sent to the user. We use AppUserRead
 * to send the user profiles to the frontend.
 */
export interface AppUser extends UserWithId {
  [PLATFORM.Orcid]?: OrcidUserDetails[];
  [PLATFORM.Twitter]?: TwitterUserDetails[];
  [PLATFORM.Nanopubs]?: NanopubUserDetails[];
}

export interface AppUserCreate {
  [PLATFORM.Orcid]?: OrcidSignupData;
  [PLATFORM.Twitter]?: TwitterSignupData;
}

/**
 * The AppUserRead replaces the details with read details (keeps the profile and users
 * boolean flags for the read and write properties)
 */
export interface AppUserRead extends UserWithId {
  [PLATFORM.Orcid]?: UserDetailsReadBase<OrcidUserDetails['profile']>[];
  [PLATFORM.Twitter]?: UserDetailsReadBase<TwitterUserDetails['profile']>[];
  [PLATFORM.Nanopubs]?: UserDetailsReadBase<NanopubUserDetails['profile']>[];
}

/** Support types */
export type DefinedIfTrue<V, R> = V extends true ? R : R | undefined;

export type HexStr = `0x${string}`;
