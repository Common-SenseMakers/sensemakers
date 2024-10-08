import { mastodon } from 'masto';

import { AccountProfile } from './types.profiles';
import { AccountDetailsBase } from './types.user';

export interface MastodonProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  domain: string;
}
export type MastodonAccountProfile = AccountProfile<MastodonProfile>;

export interface MastodonAccountCredentials {
  domain?: string;
  accessToken: string;
}

export type MastodonAccountDetails = AccountDetailsBase<{
  write?: MastodonAccountCredentials;
  read?: MastodonAccountCredentials;
}>;

export interface MastodonGetContextParams {
  mastodonServer: string;
  callback_url: string;
  type: 'read' | 'write';
}

export interface MastodonSignupContext {
  authorizationUrl: string;
  clientId: string;
  clientSecret: string;
}

export interface MastodonOAuthSignupData extends MastodonGetContextParams {
  code: string;
  clientId: string;
  clientSecret: string;
}

export interface MastodonAccessTokenSignupData {
  mastodonServer: string;
  accessToken: string;
  type: 'read' | 'write';
}

export type MastodonSignupData =
  | MastodonOAuthSignupData
  | MastodonAccessTokenSignupData;

export interface MastodonThread {
  thread_id: string;
  posts: mastodon.v1.Status[];
  author: MastodonAccount;
}

export type MastodonPost = mastodon.v1.Status;
export type MastodonAccount = mastodon.v1.Account;

export interface MastodonSigninCredentials {
  id: string;
  username: string;
  mastodonServer: string;
  accessToken: string;
}
