import { Nanopub } from '@nanopub/sign';
import { TweetV2PostTweetResult } from 'twitter-api-v2';

import { AppPostSemantics, ParserResult } from './parser.types';

export enum PLATFORM {
  ORCID = 'ORCID',
  X = 'X',
  Nanopubs = 'Nanopubs',
}

export interface OrcidDetails {
  orcid?: {
    orcid: string;
    name: string;
  };
}

export interface TwitterDetails {
  twitter?: {
    oauth_token?: string;
    oauth_token_secret?: string;
    oauth_verifier?: string;
    accessToken?: string;
    accessSecret?: string;
    user_id?: string;
    screen_name?: string;
  };
}

export interface NanopubDetails {
  eth?: {
    ethAddress: HexStr;
    rsaPublickey: string;
    ethSignature: HexStr;
    introNanopub?: string;
  };
}

export interface AppUser extends OrcidDetails, TwitterDetails, NanopubDetails {
  userId: string;
}

export interface AppUserCreate extends Omit<AppUser, 'userId'> {}

export interface AppUserRead extends AppUser {
  twitter?: {
    user_id: string;
    screen_name: string;
  };
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
