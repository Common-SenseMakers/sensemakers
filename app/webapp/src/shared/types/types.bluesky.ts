import {
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
import { ReasonRepost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

import { PlatformProfile } from './types.profiles';
import { AccountDetailsBase } from './types.user';

export interface BlueskySigninCredentials {
  id: string;
  username: string;
  name: string;
  appPassword: string;
}

export type BlueskyCredentials = AtpSessionData;

export interface BlueskyAccountCredentials {
  write?: BlueskyCredentials;
  read?: BlueskyCredentials;
}

export type BlueskyAccountDetails =
  AccountDetailsBase<BlueskyAccountCredentials>;

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
  author: PlatformProfile;
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
  embed?:
    | {
        $type: 'app.bsky.embed.record#view';
        record: QuotedBlueskyPost;
      }
    | {
        $type: 'app.bsky.embed.recordWithMedia#view';
        record: { record: QuotedBlueskyPost };
      };
  repostedBy?: ReasonRepost;
};

export interface AccessJwtPayload {
  scope: string;
  sub: string;
  iat: number;
  exp: number;
  aud: string;
}

export const BLUESKY_REPOST_URI_PARAM = 'reposted_by';
export const BLUESKY_REPOST_URI_QUERY = `?${BLUESKY_REPOST_URI_PARAM}=`;
