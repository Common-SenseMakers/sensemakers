import {
  AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyFeedPost,
} from '@atproto/api';

import { UserDetailsBase } from './types.user';

export interface BlueskyUserProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface BlueskyUserCredentials {
  appPassword: string;
}

export type BlueskyUserDetails = UserDetailsBase<
  BlueskyUserProfile,
  BlueskyUserCredentials,
  BlueskyUserCredentials
>;

export interface BlueskySignupContext {}

export type BlueskySignupData = {
  username: string;
  appPassword: string;
};
export interface BlueskyThread {
  thread_id: string;
  posts: BlueskyPost[];
  author: BlueskyAccount;
}

export type BlueskyPost = AppBskyFeedDefs.PostView & {
  record: AppBskyFeedPost.Record;
};
export type BlueskyAccount = AppBskyActorDefs.ProfileViewDetailed;
export interface BlueskyProfile {
  id: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}
