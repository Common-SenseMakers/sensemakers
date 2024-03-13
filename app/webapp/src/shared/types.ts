import { Nanopub } from '@nanopub/sign';
import { TweetV2PostTweetResult } from 'twitter-api-v2';

import { AppPostSemantics, ParserResult } from './parser.types';

export enum PLATFORM {
  Orcid = 'Orcid',
  Twitter = 'Twitter',
  Nanopubs = 'Nanopubs',
}

export interface UserDetailsBase {
  user_id: string;
}

/** ORCID */
export interface OrcidSignupContext {
  link: string;
}

export interface OrcidSignupData {
  code: string;
}

export interface OrcidUserDetails extends UserDetailsBase {
  name: string;
}

/** TWITTER */
export interface TwitterSignupContext {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed: 'true';
  url: string;
}

export type TwitterSignupData = Pick<
  TwitterSignupContext,
  'oauth_token' | 'oauth_token_secret'
> & { oauth_verifier: string };

export interface TwitterUserDetails {
  oauth_verifier: string;
  accessToken: string;
  accessSecret: string;
  user_id: string;
  screen_name: string;
}

/** NANOPUB */
export interface NanopubUserDetails extends UserDetailsBase {
  rsaPublickey: string;
  ethAddress: HexStr;
  ethSignature: HexStr;
  introNanopub?: string;
}

export interface AppUser {
  userId: string;
  orcid?: OrcidUserDetails[];
  twitter?: TwitterUserDetails[];
  nanopub?: NanopubUserDetails[];
}

export interface AppUserCreate extends Omit<AppUser, 'userId'> {}

export interface AppUserRead extends Omit<AppUser, 'twitter'> {
  twitter: Array<Pick<TwitterUserDetails, 'user_id' | 'screen_name'>>;
}

export type DefinedIfTrue<V, R> = V extends true ? R : R | undefined;

export interface TwitterUser {
  user_id: string;
  screen_name: string;
}

export interface AppPostCreate {
  content: string;
  originalParsed?: ParserResult;
  semantics?: AppPostSemantics;
  signedNanopub?: { uri: string };
  platforms: PLATFORM[];
}

export interface AppPostGetSemantics {
  content: string;
}

export interface AppPostConstructNanopub {
  content: string;
}

export type AppPostStore = AppPostCreate & {
  author: string;
  tweet?: TweetRead;
  nanopub?: Nanopub;
};

export type TweetRead = TweetV2PostTweetResult['data'];

export type AppPost = AppPostStore & {
  id: string;
};

export interface AppGetSparkQL {
  query: string;
}

export type HexStr = `0x${string}`;
