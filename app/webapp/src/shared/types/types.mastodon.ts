import { UserDetailsBase } from './types.user';

export interface MastodonUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mastodonServer: string;
}

export interface MastodonUserRead {
  accessToken: string;
}

export interface MastodonUserWrite {
  accessToken: string;
}

export type MastodonUserDetails = UserDetailsBase<
  MastodonUserProfile,
  MastodonUserRead,
  MastodonUserWrite
>;

export interface MastodonSignupContext {
  authorizationUrl: string;
}

export interface MastodonSignupData {
  code: string;
  domain: string;
  type: 'read' | 'write';
}
