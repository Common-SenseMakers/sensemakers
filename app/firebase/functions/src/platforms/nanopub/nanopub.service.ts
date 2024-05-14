import { Nanopub } from '@nanopub/sign';
import { verifyMessage } from 'viem';

import {
  FetchParams,
  PLATFORM,
  UserDetailsBase,
} from '../../@shared/types/types';
import {
  NanopubUserProfile,
  NanupubSignupData,
} from '../../@shared/types/types.nanopubs';
import {
  FetchedResult,
  PlatformPost,
  PlatformPostDraft,
  PlatformPostDraftApprova,
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../@shared/types/types.platform.posts';
import {
  AppPostMirror,
  GenericPostData,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import { getEthToRSAMessage } from '../../@shared/utils/nanopub.sign.util';
import { NANOPUBS_PUBLISH_SERVERS_STR } from '../../config/config.runtime';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { PlatformService } from '../platforms.interface';
import { createIntroNanopublication } from './create.intro.nanopub';
import { createNanopublication } from './create.nanopub';

const DEBUG = false;

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
    if (DEBUG) logger.debug('nanopub: handleSignupData', { signupData });

    const valid = verifyMessage({
      address: signupData.ethAddress,
      message: getEthToRSAMessage(signupData.rsaPublickey),
      signature: signupData.ethToRsaSignature,
    });

    if (!valid) {
      throw new Error('Invalid signature');
    }

    /** publish nanopub */
    if (!signupData.introNanopub) {
      throw new Error(`Intro nanopub not found`);
    }

    const published = await this.publishInternal(signupData.introNanopub);
    if (!published) {
      throw new Error(`Error publishing intro nanopub`);
    }

    if (DEBUG)
      logger.debug('nanopub: intro published', { published: published.info() });

    return {
      user_id: signupData.ethAddress,
      signupDate: this.time.now(),
      profile: {
        rsaPublickey: signupData.rsaPublickey,
        ethAddress: signupData.ethAddress,
        introNanopub: signupData.introNanopub,
        ethToRsaSignature: signupData.ethToRsaSignature,
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
      postApproval: PlatformPostDraftApprova.PENDING,
    };
  }

  async publishInternal(signed: string) {
    const nanopub = new Nanopub(signed);

    let stop: boolean = false;
    let serverIx = 0;

    let published: Nanopub | undefined = undefined;

    const NANOPUBS_PUBLISH_SERVERS = JSON.parse(
      NANOPUBS_PUBLISH_SERVERS_STR.value()
    );

    while (!stop) {
      try {
        if (serverIx < NANOPUBS_PUBLISH_SERVERS.length) {
          published = await nanopub.publish(
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

    return published;
  }

  /**
   * Receives a list of PostToPublish (platformPost, mirrors and user credentials) and returns
   * a list of the updated platformPosts
   */
  async publish(
    postPublish: PlatformPostPublish<any>,
    _manager: TransactionManager
  ): Promise<PlatformPostPosted<any>> {
    const published = await this.publishInternal(postPublish.draft);

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
    params: FetchParams,
    userDetails: UserDetailsBase
  ): Promise<FetchedResult> {
    return { fetched: {}, platformPosts: [] };
  }

  mirror(postsToMirror: AppPostMirror[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }
}
