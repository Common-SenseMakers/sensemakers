import { TimeService } from 'src/time/time.service';
import { UsersService } from 'src/users/users.service';

import {
  FetchParams,
  PLATFORM,
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types';
import {
  PlatformPostCreate,
  PlatformPostPublish,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../@shared/types/types.platform.posts';
import { TransactionManager } from '../db/transaction.manager';
import { IdentityService, PlatformService } from './platforms.interface';

interface FetchUserParams {
  params: FetchParams;
  userDetails: UserDetailsBase;
}

export type FetchAllUserPostsParams = Map<PLATFORM, FetchUserParams[]>;
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
  constructor(
    protected platforms: PlatformsMap,
    protected time: TimeService,
    protected users: UsersService
  ) {}

  // TODO set the return type depending on the value of platformId
  public get<T extends PlatformService>(platformId: PLATFORM): T {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }
    return platform as T;
  }

  public async fetch(
    platformId: PLATFORM,
    params: FetchParams,
    userDetails: UserDetailsBase,
    manager: TransactionManager
  ) {
    /** all fetched posts from one platform */
    const fetched = await this.get(platformId).fetch(
      params,
      userDetails,
      manager
    );

    await this.users.repo.setAccountFetched(
      platformId,
      userDetails.user_id,
      fetched.fetched,
      manager
    );

    /** convert them into a PlatformPost */
    return fetched.platformPosts.map((fetchedPost) => {
      const platformPost: PlatformPostCreate = {
        platformId: platformId as PUBLISHABLE_PLATFORMS,
        publishStatus: PlatformPostPublishStatus.PUBLISHED,
        publishOrigin: PlatformPostPublishOrigin.FETCHED,
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
    postPublish: PlatformPostPublish,
    manager: TransactionManager
  ) {
    const platform = this.get(platformId);
    return platform.publish(postPublish, manager);
  }
}
