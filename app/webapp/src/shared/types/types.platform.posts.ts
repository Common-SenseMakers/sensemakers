import { PLATFORM, PUBLISHABLE_PLATFORMS, UserDetailsBase } from './types';
import { AppPost } from './types.posts';

/**
 * Platform posts as stored in our DB. A platform post can be in one of these statuses
 * - 'draft': The post has an `id`, a `platformId` value, and a `draft` value.
 * - 'posted': The post has been published on the platform and has a defined `postedStatus`.
 * - 'fetched': The post was fetched from the platform, has a defined `postedStatus`
 * */

/**
 * A PlatformPost is on object that was already stored on our DB
 * */
export interface PlatformPost<C = any, D = any> {
  id: string; // Internal id generated by firestore
  platformId: PUBLISHABLE_PLATFORMS;
  publishStatus: 'draft' | 'published';
  publishOrigin: 'fetched' | 'posted';
  posted?: PlatformPostPosted<C>;
  draft?: PlatformPostDraft<D>;
}

export type PlatformPostCreate<C = any> = Omit<PlatformPost<C>, 'id'>;

/**
 * The PlatformPostPosted status is defined after a PlatformPost
 * has been published to its platform
 */
export interface PlatformPostPosted<C = any> {
  user_id: string; // The itended user_id of when publishing
  // platformId?: PUBLISHABLE_PLATFORMS; // Only needed in some cases
  post_id: string; // The id of the platform post on the platform
  timestampMs: number; // timestamp in ms
  post: C;
}

/**
 * The PlatformPostDraft status is defined prior to posting a PlatformPost
 */
export interface PlatformPostDraft<D = any> {
  user_id: string; // The intended user_id of when publishing
  postApproval: 'pending' | 'approved';
  post?: D;
}

/**
 * The PlatformPostPublish object is used to publish a post on a platform
 * */
export interface PlatformPostPublish<D = any> {
  draft: D;
  userDetails: UserDetailsBase;
}

export type PerPlatformPublish = Map<PLATFORM, PlatformPostPublish[]>;

export interface PlatformPostCreated {
  platformPost: PlatformPost;
  post: AppPost; // In case a post was created
}
