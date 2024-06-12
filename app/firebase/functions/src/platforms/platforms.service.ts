import { TimeService } from '../time/time.service';
import { UsersService } from '../users/users.service';

import { FetchParams, PlatformFetchParams } from '../@shared/types/types.fetch';
import {
  PlatformPostCreate,
  PlatformPostPublish,
} from '../@shared/types/types.platform.posts';
import { PLATFORM, UserDetailsBase } from '../@shared/types/types.user';
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
    params: PlatformFetchParams,
    userDetails: UserDetailsBase,
    manager: TransactionManager
  ) {
    /** all fetched posts from one platform */
    const fetched = await this.get(platformId).fetch(
      params,
      userDetails,
      manager
    );
    return fetched;
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
