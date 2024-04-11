import {
  PLATFORM,
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types';
import {
  PlatformPostCreate,
  PlatformPostPublishWithCrendentials,
} from '../@shared/types/types.platform.posts';
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
   * fetch posts from the provided platforms and for the provided user_ids and timestamps
   * */
  public async fetchAll(
    fetchParams: FetchAllUserPostsParams
  ): Promise<PlatformPostCreate[]> {
    const all = await Promise.all(
      Array.from(fetchParams.keys()).map(async (platformId) => {
        const thisFetchParams = fetchParams.get(platformId);
        if (thisFetchParams) {
          return this.fetchOne(platformId, thisFetchParams);
        } else {
          return [];
        }
      })
    );

    return all.flat();
  }

  public async fetchOne(
    platformId: PLATFORM,
    thisFetchParams: FetchUserPostsParams[]
  ) {
    /** all fetched posts from one platform */
    const fetched = await this.get(platformId).fetch(thisFetchParams);

    /** convert them into a PlatformPost */
    return fetched.map((fetchedPost) => {
      const platformPost: PlatformPostCreate = {
        platformId: platformId as PUBLISHABLE_PLATFORMS,
        publishStatus: 'published',
        publishOrigin: 'fetched',
        posted: fetchedPost,
      };

      return platformPost;
    });
  }

  public convertToGeneric(platformPost: PlatformPostCreate) {
    const platform = this.get(platformPost.platformId);
    return platform.convertToGeneric(platformPost);
  }

  public publish(
    platformId: PLATFORM,
    posts: PlatformPostPublishWithCrendentials[]
  ) {
    const platform = this.get(platformId);
    return platform.publish(posts);
  }
}
