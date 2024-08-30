import { UserDetailsBase } from './types.user';

export interface MastodonUserProfile {
  username: string;
  display_name: string;
  avatar: string;
  url: string;
}

export interface MastodonUserRead {
  access_token: string;
}

export interface MastodonUserWrite {
  access_token: string;
}

export type MastodonUserDetails = UserDetailsBase<
  MastodonUserProfile,
  MastodonUserRead,
  MastodonUserWrite
>;
