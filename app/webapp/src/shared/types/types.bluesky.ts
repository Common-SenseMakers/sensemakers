import {
  AppBskyActorDefs,
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyRichtextFacet,
  AtpSessionData,
} from '@atproto/api';

import { AccountDetailsBase } from './types.user';

export interface BlueskySigninCredentials {
  id: string;
  username: string;
  name: string;
  appPassword: string;
}

export type BlueskyUserCredentials = AtpSessionData;

export type BlueskyAccountDetails = AccountDetailsBase<{
  write: BlueskyUserCredentials;
  read: BlueskyUserCredentials;
}>;

export interface BlueskyProfile {
  id: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

export interface BlueskyGetContextParams {
  callback_url: string;
  type: 'read' | 'write';
}
export interface BlueskySignupContext {}

export type BlueskySignupData = {
  username: string;
  appPassword: string;
  type: 'read' | 'write';
};
export interface BlueskyThread {
  thread_id: string;
  posts: BlueskyPost[];
  author: BlueskyAccount;
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
export type BlueskyAccount = AppBskyActorDefs.ProfileViewDetailed;
