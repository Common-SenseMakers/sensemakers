import { AppPostFull } from './types.posts';
import { PLATFORM } from './types.user';

export interface OurTokenConfig {
  tokenSecret: string;
  expiresIn: string;
}

export interface HandleSignupResult {
  userId: string;
  ourAccessToken?: string;
}

/** there are two fetch modes:
 * - sinceId !== undefined: try to return expectedAmount or all posts after this provided sinceId
 * - untilId !== undefined : try to return expectedAmount or all posts before this provided untilId
 */
export interface FetchParams {
  sinceId?: string;
  untilId?: string;
  expectedAmount: number;
}

/** ids are in terms of platformPost post_id */
export interface PlatformFetchParams {
  since_id?: string;
  until_id?: string;
  expectedAmount: number;
}

export interface UserProfileQuery {
  platformId: PLATFORM;
  username: string;
}

export interface PublishPostPayload {
  post: AppPostFull;
  platformIds: PLATFORM[];
}

export interface AddUserDataPayload {
  username: string;
  mastodonServer?: string;
  platformId: PLATFORM;
  amount: number;
  latest?: boolean;
  userId?: string;
  isGhost: true;
}
