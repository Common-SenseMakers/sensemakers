import { PlatformFetchParams } from '../@shared/types/types.fetch';
import {
  PlatformPostCreate,
  PlatformPostPublish,
} from '../@shared/types/types.platform.posts';
import { PLATFORM } from '../@shared/types/types.platforms';
import { AccountCredentials } from '../@shared/types/types.user';
import { TimeService } from '../time/time.service';
import { UsersService } from '../users/users.service';
import { IdentityService, PlatformService } from './platforms.interface';

export type PlatformsMap = Map<PLATFORM, PlatformService>;

export type IdentityServicesMap = Map<PLATFORM, IdentityService>;

/** a wrapper of the PlatformSerivces to get defined and typed Platform services */
export class PlatformsService {
  constructor(
    protected platforms: PlatformsMap,
    protected time: TimeService,
    protected users: UsersService
  ) {}

  public get<T extends PlatformService>(platformId: PLATFORM): T {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }
    return platform as T;
  }

  public async fetch(
    user_id: string,
    platformId: PLATFORM,
    params: PlatformFetchParams,
    credentials?: AccountCredentials
  ) {
    /** all fetched posts from one platform */
    const fetched = await this.get(platformId).fetch(
      user_id,
      params,
      credentials
    );
    return fetched;
  }

  public convertToGeneric(platformPost: PlatformPostCreate) {
    const platform = this.get(platformPost.platformId);
    return platform.convertToGeneric(platformPost);
  }

  public publish(platformId: PLATFORM, postPublish: PlatformPostPublish) {
    const platform = this.get(platformId);
    return platform.publish(postPublish);
  }

  public getProfile(platformId: PLATFORM, user_id: string, credentials?: any) {
    const platform = this.get(platformId);
    return platform.getProfile(user_id, credentials);
  }
}
