import { IDENTITY_PLATFORM, PLATFORM } from './types.platforms';
import { AppPostFull } from './types.posts';

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
  platformId: IDENTITY_PLATFORM;
  amount: number;
  latest?: boolean;
}
