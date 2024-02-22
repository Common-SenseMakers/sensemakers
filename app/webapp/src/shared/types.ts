import { Nanopub } from '@nanopub/sign';
import { TweetV2PostTweetResult } from 'twitter-api-v2';

import { AppPostSemantics, ParserResult } from './parser.types';

export interface AppUser {
  userId: string;
  orcid?: {
    orcid: string;
    name: string;
  };
  twitter?: {
    oauth_token?: string;
    oauth_token_secret?: string;
    oauth_verifier?: string;
    accessToken?: string;
    accessSecret?: string;
    user_id?: string;
    screen_name?: string;
  };
  eth?: EthAccountDetails;
}

export interface EthAccountDetails {
  ethAddress: HexStr;
  rsaPublickey: string;
  ethSignature: HexStr;
  introNanopub?: string;
}

export interface AppUserRead {
  userId: string;
  orcid?: {
    orcid: string;
    name: string;
  };
  twitter?: {
    user_id: string;
    screen_name: string;
  };
  eth?: EthAccountDetails;
}

export type DefinedIfTrue<V, R> = V extends true ? R : R | undefined;

export interface TwitterUser {
  user_id: string;
  screen_name: string;
}

export enum PLATFORM {
  X = 'X',
  Nanopubs = 'Nanopubs',
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

export type HexStr = `0x${string}`;
