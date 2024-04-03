import {
  PLATFORM,
  UserDetailsBase,
  WithPlatformUserId,
} from '../@shared/types';
import { AppPostPublish, PlatformPost } from '../@shared/types.posts';
import {
  FetchUserPostsParams,
  IdentityService,
  PlatformService,
} from './platforms.interface';

export type FetchAllUserPostsParams = Map<PLATFORM, FetchUserPostsParams[]>;
export type PlatformsMap = Map<
  PLATFORM,
  PlatformService<any, any, WithPlatformUserId>
>;

export type IdentityServicesMap = Map<
  PLATFORM,
  IdentityService<any, any, WithPlatformUserId>
>;

/** a simple wrapper of the Map to get defined and typed Platform services */
export class PlatformsService {
  constructor(protected platforms: PlatformsMap) {}

  // TODO set the return type depending on the value of platformId
  public get(platformId: PLATFORM) {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }
    return platform;
  }

  /**
   * fetch posts from the provided platforms and for the provided user_ids and timestemps
   * */
  public async fetch(
    fetchParams: FetchAllUserPostsParams
  ): Promise<PlatformPost[]> {
    const allPosts = await Promise.all(
      Array.from(fetchParams.keys()).map(
        async (platformId): Promise<PlatformPost[]> => {
          const thisFetchParams = fetchParams.get(platformId);
          if (thisFetchParams) {
            return this.get(platformId).fetch(thisFetchParams);
          } else {
            return [];
          }
        }
      )
    );

    /** concatenate the results from all platforms */
    return allPosts.reduce((acc, currArray) => acc.concat(currArray), []);
  }

  public convertToGeneric(platformPost: PlatformPost) {
    const platform = this.get(platformPost.platformId);
    return platform.convertToGeneric(platformPost);
  }

  public publish(
    platformId: PLATFORM,
    post: AppPostPublish,
    write: NonNullable<UserDetailsBase['write']>
  ) {
    const platform = this.get(platformId);
    return platform.publish(post, write);
  }
}
