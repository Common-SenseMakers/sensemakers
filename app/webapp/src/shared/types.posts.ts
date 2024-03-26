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

/** Basic interface of a Post object */
export interface AppPost {
  id: string;
  authorId: string;
  content: string;
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  originals: {
    [PLATFORM.Twitter]: TweetV2;
    [PLATFORM.Nanopubs]: any;
  };
}
