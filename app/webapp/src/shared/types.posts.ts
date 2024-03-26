import { TweetV2 } from 'twitter-api-v2';

import { PLATFORM } from './types';
import { AppPostSemantics, ParsePostResult } from './types.parser';

/**
 * Common interface that all platforms should return when they
 * return a Post
 * */
export interface PlatformPost<C = any> {
  platformId: PLATFORM;
  user_id: string;
  post_id: string;
  timestamp: number; // timestamp in ms
  original: C;
}

export interface MirrorStatus<C = any> {
  shouldPost: boolean;
  user_id: string;
  platformPost: C;
}

/** Basic interface of a Post object */
export interface AppPost {
  id: string;
  authorId: string;
  content: string;
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
export type AppPostPublish = Omit<
  AppPost,
  'id' | 'originals' | 'authorId' | 'parseStatus' | 'reviewedStatus' | 'mirrors'
>;
