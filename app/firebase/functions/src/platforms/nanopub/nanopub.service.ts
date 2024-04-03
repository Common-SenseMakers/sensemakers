import { PLATFORM, UserDetailsBase } from '../../@shared/types';
import { NanopubUserProfile } from '../../@shared/types.nanopubs';
import { AppPost, PlatformPost } from '../../@shared/types.posts';
import {
  FetchUserPostsParams,
  GenericPostData,
  PlatformService,
} from '../platforms.interface';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

/** Twitter service handles all interactions with Twitter API */
export class NanopubService
  implements
    PlatformService<undefined, undefined, UserDetailsBase<NanopubUserProfile>>
{
  constructor() {}

  /** converts a post into a nanopublication string */
  async convertFromGeneric(post: AppPost): Promise<PlatformPost<string>> {
    return {
      post_id: '',
      platformId: PLATFORM.Nanopubs,
      timestampMs: 0,
      user_id: '',
      mirrorOf: post.id,
      original: '',
    };
  }

  publish(
    post: AppPostPublish,
    userDetails: UserDetailsBase<any, any, any>
  ): Promise<PlatformPost<any>> {
    throw new Error('Method not implemented.');
  }

  fetch(params: FetchUserPostsParams[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }

  convertToGeneric(platformPost: PlatformPost<any>): GenericPostData {
    throw new Error('Method not implemented.');
  }

  mirror(postsToMirror: AppPostMirror[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }

  getSignupContext: (
    userId?: string | undefined,
    params?: any
  ) => Promise<undefined>;

  handleSignupData: (
    signupData: undefined
  ) => Promise<UserDetailsBase<NanopubUserProfile, any, any>>;
}
