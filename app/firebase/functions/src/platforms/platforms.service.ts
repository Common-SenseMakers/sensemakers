import {
  PLATFORM,
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types';
import {
  AppPostFull,
  PlatformPost,
  PlatformPostBase,
} from '../@shared/types/types.posts';
import {
  FetchUserPostsParams,
  IdentityService,
  PlatformService,
} from './platforms.interface';

export type FetchAllUserPostsParams = Map<PLATFORM, FetchUserPostsParams[]>;
export type PlatformsMap = Map<
  PLATFORM,
  PlatformService<any, any, UserDetailsBase>
>;

export type IdentityServicesMap = Map<
  PLATFORM,
  IdentityService<any, any, UserDetailsBase>
>;

/** a wrapper of the PlatformSerivces to get defined and typed Platform services */
export class PlatformsService {
  constructor(protected platforms: PlatformsMap) {}

  // TODO set the return type depending on the value of platformId
  public get<T extends PlatformService>(platformId: PLATFORM): T {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }
    return platform as T;
  }

  /**
   * fetch posts from the provided platforms and for the provided user_ids and timestemps
   * */
  public async fetch(
    fetchParams: FetchAllUserPostsParams
  ): Promise<PlatformPostBase[]> {
    const allPosts = await Promise.all(
      Array.from(fetchParams.keys()).map(async (platformId) => {
        const thisFetchParams = fetchParams.get(platformId);
        if (thisFetchParams) {
          const posts = await this.get(platformId).fetch(thisFetchParams);
          /** append the platformId */
          const postWithPlatform = posts.map((p): PlatformPostBase => {
            return { ...p, platformId: platformId as PUBLISHABLE_PLATFORMS };
          });
          return postWithPlatform;
        } else {
          return [];
        }
      })
    );

    /** concatenate the results from all platforms */
    return allPosts.flat();
  }

  public convertToGeneric(platformPost: PlatformPost) {
    const platform = this.get(platformPost.platformId);
    return platform.convertToGeneric(platformPost);
  }

  public publish(platformId: PLATFORM, posts: AppPostFull[]) {
    const platform = this.get(platformId);
    return platform.publish(posts);
  }
}
