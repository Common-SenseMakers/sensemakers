import { TweetV2 } from 'twitter-api-v2';

import { PLATFORM, UserDetailsBase } from './types';
import { AppPostSemantics, ParsePostResult } from './types.parser';

/**
 * Common interface that all platforms should return when they
 * return a Post
 * */
export interface PlatformPost<C = any> {
  platformId: PLATFORM;
  user_id: string;
  post_id: string;
  timestampMs: number; // timestamp in ms
  mirrorOf?: string;
  original: C;
}

export interface MirrorStatus<P = any, D = any> {
  platformId: PLATFORM;
  user_id: string;
  postApproval: 'pending' | 'should-post' | 'not-needed';
  status: 'draft' | 'posted' | 'fetched';
  platformDraft?: D; // a draft is prepared before it gets published (it could be the unsigned version of a post)
  platformPost?: P; // the actual platform post as it was published on the platform (it could be signed and include further data not in the draft)
}

/** Basic interface of a Post object */
export interface AppPost {
  id: string;
  authorId: string;
  content: string;
  origin: PLATFORM; // The platform where the post originated
  parseStatus: 'unprocessed' | 'processed';
  reviewedStatus: 'pending' | 'reviewed';
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  mirrors: Partial<{
    [PLATFORM.Twitter]: MirrorStatus<TweetV2>[];
    [PLATFORM.Nanopubs]: MirrorStatus[];
  }>;
}

/** AppPost sent to a PlatformService to be published */
export interface PostToPublish {
  post: AppPost;
  userDetails: UserDetailsBase;
}

export interface AppPostPublish {}

/**
 * Payload to signal which post is to be mirrored on which platforms,
 */
export interface AppPostMirror {
  postId: string;
  content?: string;
  semantics?: AppPostSemantics;
  mirrors: MirrorStatus[];
}

export type PostUpdate = Pick<AppPost, 'id' | 'content' | 'semantics'>;
