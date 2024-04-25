import { Nanopub } from '@nanopub/sign';
import { TransactionManager } from 'src/db/transaction.manager';
import { verifyMessage } from 'viem';

import { PLATFORM, UserDetailsBase } from '../../@shared/types/types';
import {
  NanopubUserProfile,
  NanupubSignupData,
} from '../../@shared/types/types.nanopubs';
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
import { getRsaToEthMessage } from '../../@shared/utils/sig.utils';
import { NANOPUBS_PUBLISH_SERVERS } from '../../config/config.runtime';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { FetchUserPostsParams, PlatformService } from '../platforms.interface';
import { createIntroNanopublication } from './create.intro.nanopub';
import { createNanopublication } from './create.nanopub';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

/** Twitter service handles all interactions with Twitter API */
export class NanopubService
  implements
    PlatformService<
      NanopubUserProfile,
      NanupubSignupData,
      UserDetailsBase<NanopubUserProfile>
    >
{
  constructor(protected time: TimeService) {}

  async getSignupContext(
    userId: string | undefined,
    params?: NanupubSignupData
  ): Promise<NanopubUserProfile> {
    if (!params) {
      throw new Error('Missing params');
    }

    const introNanopub = await createIntroNanopublication(params);
    return { ...params, introNanopub: introNanopub.rdf() };
  }

  /** verifies signatures, creates intro nanopub */
  async handleSignupData(
    signupData: NanupubSignupData
  ): Promise<UserDetailsBase<NanopubUserProfile, any, any>> {
    /** verify ethSignature */
    const valid = verifyMessage({
      address: signupData.ethAddress,
      message: getRsaToEthMessage(signupData.rsaPublickey),
      signature: signupData.ethToRsaSignature,
    });

    if (!valid) {
      throw new Error('Invalid signature');
    }

    return {
      user_id: signupData.ethAddress,
      signupDate: this.time.now(),
      lastFetchedMs: 0,
      profile: {
        rsaPublickey: signupData.rsaPublickey,
        ethAddress: signupData.ethAddress,
        introNanopub: signupData.introNanopub,
      },
    };
  }

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
    postPublish: PlatformPostPublish<any>,
    _manager: TransactionManager
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

  async fetch(
    params: FetchUserPostsParams
  ): Promise<PlatformPostPosted<any>[]> {
    return [];
  }

  mirror(postsToMirror: AppPostMirror[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }
}
