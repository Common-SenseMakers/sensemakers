import { mastodon } from 'masto';

import { UserDetailsBase } from './types.user';

export interface MastodonUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  domain: string;
}

export interface MastodonUserCredentials {
  accessToken: string;
}

export type MastodonUserDetails = UserDetailsBase<
  MastodonUserProfile,
  MastodonUserCredentials,
  MastodonUserCredentials
>;

export interface MastodonGetContextParams {
  domain: string;
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
  domain: string;
  accessToken: string;
  type: 'read' | 'write';
}

export type MastodonSignupData =
  | MastodonOAuthSignupData
  | MastodonAccessTokenSignupData
  | MastodonGhostSignupData;

export type MastodonGhostSignupData = {
  username: string;
  domain: string;
  isGhost: true;
};

export interface MastodonThread {
  thread_id: string;
  posts: mastodon.v1.Status[];
  author: MastodonAccount;
}

export type MastodonPost = mastodon.v1.Status;
export type MastodonAccount = mastodon.v1.Account;
