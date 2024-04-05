import { PLATFORM, PostAndAuthor, UserDetailsBase } from '../../@shared/types';
import { NanopubUserProfile } from '../../@shared/types.nanopubs';
import {
  AppPostMirror,
  PlatformPost,
  PostToPublish,
} from '../../@shared/types.posts';
import { TimeService } from '../../time/time.service';
import {
  FetchUserPostsParams,
  GenericPostData,
  PlatformService,
} from '../platforms.interface';
import { createNanopublication } from './create.nanopub';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

/** Twitter service handles all interactions with Twitter API */
export class NanopubService
  implements
    PlatformService<undefined, undefined, UserDetailsBase<NanopubUserProfile>>
{
  constructor(protected time: TimeService) {}

  /** converts a post into a nanopublication string */
  async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPost<string>> {
    const nanopubDraft = await createNanopublication(
      postAndAuthor.post,
      postAndAuthor.author
    );
    /** post_id is not defined until it's signed  */

    return {
      post_id: '',
      user_id: '',
      platformId: PLATFORM.Nanopub,
      timestampMs: this.time.now(),
      mirrorOf: postAndAuthor.post.id,
      original: nanopubDraft.rdf(),
    };
  }

  publish(posts: PostToPublish[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }

  convertToGeneric(platformPost: PlatformPost<any>): Promise<GenericPostData> {
    throw new Error('Method not implemented.');
  }

  fetch(params: FetchUserPostsParams[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }

  mirror(postsToMirror: AppPostMirror[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }
  getSignupContext(
    userId?: string | undefined,
    params?: any
  ): Promise<undefined> {
    throw new Error('Method not implemented.');
  }

  handleSignupData(
    signupData: undefined
  ): Promise<UserDetailsBase<NanopubUserProfile, any, any>> {
    throw new Error('Method not implemented.');
  }
}
