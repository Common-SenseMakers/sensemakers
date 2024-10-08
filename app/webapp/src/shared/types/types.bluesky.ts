import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyRichtextFacet,
} from '@atproto/api';

import { AccountProfile } from './types.profiles';
import { AccountDetailsBase } from './types.user';

export interface BlueskySigninCredentials {
  id: string;
  username: string;
  name: string;
  appPassword: string;
}

export type BlueskyCredentials = {
  username: string;
  appPassword: string;
};

export interface BlueskyAccountCredentials {
  write?: BlueskyCredentials;
  read?: BlueskyCredentials;
}

export type BlueskyAccountDetails =
  AccountDetailsBase<BlueskyAccountCredentials>;

export interface BlueskyProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
}
export type BlueskyAccountProfile = AccountProfile<BlueskyProfile>;

export interface BlueskyGetContextParams {
  callback_url: string;
  type: 'read' | 'write';
}
export interface BlueskySignupContext {}

export type BlueskyAppPasswordSignupData = {
  username: string;
  appPassword: string;
  type: 'read' | 'write';
};

export type BlueskyGhostSignupData = {
  username: string;
  isGhost: true;
};

export type BlueskySignupData =
  | BlueskyAppPasswordSignupData
  | BlueskyGhostSignupData;

export interface BlueskyThread {
  thread_id: string;
  posts: BlueskyPost[];
  author: BlueskyProfile;
}

export interface QuotedBlueskyPost {
  $type: string;
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  value: {
    text: string;
    $type: string;
    createdAt: string;
    facets?: AppBskyRichtextFacet.Main[];
    embed?:
      | AppBskyEmbedImages.Main
      | AppBskyEmbedVideo.Main
      | AppBskyEmbedExternal.Main
      | AppBskyEmbedRecord.Main
      | AppBskyEmbedRecordWithMedia.Main
      | { $type: string; [k: string]: unknown };
  };
  indexedAt: string;
}

export type BlueskyPost = AppBskyFeedDefs.PostView & {
  record: AppBskyFeedPost.Record;
  embed?: {
    $type: string;
    record: QuotedBlueskyPost;
  };
};
