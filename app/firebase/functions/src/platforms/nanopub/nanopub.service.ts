import { Nanopub } from '@nanopub/sign';
import { UsersHelper } from 'src/users/users.helper';

import { PLATFORM, UserDetailsBase } from '../../@shared/types/types';
import { NanopubUserProfile } from '../../@shared/types/types.nanopubs';
import {
  PlatformPost,
  PlatformPostDraft,
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../@shared/types/types.platform.posts';
import {
  AppPostMirror,
  GenericPostData,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import { NANOPUBS_PUBLISH_SERVERS } from '../../config/config.runtime';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { FetchUserPostsParams, PlatformService } from '../platforms.interface';
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

  /** converts a post into a nanopublication draft */
  async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<string>> {
    /** TODO: What if one user has many nanopub accounts? */

    const account = UsersHelper.getAccount(
      postAndAuthor.author,
      PLATFORM.Nanopub,
      undefined,
      true
    );

    const nanopubDraft = await createNanopublication(
      postAndAuthor.post,
      postAndAuthor.author
    );

    return {
      post: nanopubDraft.rdf(),
      user_id: account.user_id,
      postApproval: 'pending',
    };
  }

  /**
   * Receives a list of PostToPublish (platformPost, mirrors and user credentials) and returns
   * a list of the updated platformPosts
   */
  async publish(
    postPublish: PlatformPostPublish
  ): Promise<PlatformPostPosted<any>> {
    let published: Nanopub | undefined = undefined;
    const draft = new Nanopub(postPublish.draft);

    let stop: boolean = false;
    let serverIx = 0;

    while (!stop) {
      try {
        if (serverIx < NANOPUBS_PUBLISH_SERVERS.length) {
          published = await draft.publish(
            undefined,
            NANOPUBS_PUBLISH_SERVERS[serverIx]
          );
          stop = true;
        } else {
          stop = true;
        }
      } catch (error) {
        logger.error(
          `Error publishing nanopub from ${NANOPUBS_PUBLISH_SERVERS[serverIx]}, retrying`,
          error
        );
        serverIx++;
      }
    }

    if (published) {
      console.log('Check info()');
      const platfformPostPosted: PlatformPostPosted = {
        post_id: published.info().uri,
        timestampMs: Date.now(),
        user_id: postPublish.userDetails.user_id,
        post: published.rdf(),
      };
      return platfformPostPosted;
    }

    throw new Error('Could not publish nanopub');
  }

  convertToGeneric(platformPost: PlatformPost<any>): Promise<GenericPostData> {
    throw new Error('Method not implemented.');
  }

  fetch(params: FetchUserPostsParams): Promise<PlatformPostPosted<any>[]> {
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
