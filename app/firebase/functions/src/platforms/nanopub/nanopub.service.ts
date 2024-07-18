import { Nanopub, NpProfile } from '@nanopub/sign';
import { verifyMessage } from 'viem';

import { FetchParams } from '../../@shared/types/types.fetch';
import {
  NanopubUserProfile,
  NanupubSignupData,
  RSAKeys,
} from '../../@shared/types/types.nanopubs';
import {
  FetchedResult,
  PlatformPost,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostPosted,
  PlatformPostPublish,
  PlatformPostUpdate,
} from '../../@shared/types/types.platform.posts';
import {
  AppPostMirror,
  GenericThread,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import { TwitterUserDetails } from '../../@shared/types/types.twitter';
import {
  AutopostOption,
  PLATFORM,
  UserDetailsBase,
} from '../../@shared/types/types.user';
import { getEthToRSAMessage } from '../../@shared/utils/nanopub.sign.util';
import { cleanPrivateKey } from '../../@shared/utils/semantics.helper';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { PlatformService } from '../platforms.interface';
import { createIntroNanopublication } from './create.intro.nanopub';
import { createNanopublication } from './create.nanopub';

const DEBUG = false;

export interface NanopubServiceConfig {
  servers: string[];
  rsaKeys: RSAKeys;
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
  constructor(
    protected time: TimeService,
    protected config: NanopubServiceConfig
  ) {}

  async getSignupContext(
    userId: string | undefined,
    params?: NanupubSignupData
  ): Promise<NanopubUserProfile> {
    if (!params) {
      throw new Error('Missing params');
    }
    if (!userId) {
      throw new Error('Missing userId');
    }
    const { db, users } = createServices();
    const user = await db.run(async (manager) => {
      return users.repo.getUser(userId, manager, true);
    });

    const twitterAccount: TwitterUserDetails | undefined =
      UsersHelper.getAccounts(user, PLATFORM.Twitter).pop();
    if (!twitterAccount) {
      throw new Error(`Twitter account not found`);
    }

    const twitterUsername = twitterAccount.profile?.username;
    const twitterName = twitterAccount.profile?.name;

    if (!twitterUsername || !twitterName) {
      throw new Error(`Twitter username or name not found`);
    }

    const autopostingEnabled =
      user.settings.autopost[PLATFORM.Nanopub].value !== AutopostOption.MANUAL;

    const introNanopub = await createIntroNanopublication(
      params,
      {
        username: twitterUsername,
        name: twitterName,
      },
      this.config.rsaKeys.publicKey,
      autopostingEnabled
    );

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
      unsignedPost: nanopubDraft.rdf(),
      user_id: account.user_id,
      postApproval: PlatformPostDraftApproval.PENDING,
    };
  }

  async signDraft(
    post: PlatformPostDraft<any>,
    account: UserDetailsBase<any, any, any>
  ): Promise<string> {
    try {
      const profile = new NpProfile(
        cleanPrivateKey({
          privateKey: this.config.rsaKeys.privateKey,
          publicKey: this.config.rsaKeys.publicKey,
        })
      );
      const signed = new Nanopub(post.unsignedPost).sign(profile);
      return signed.rdf();
    } catch (error) {
      logger.error('Error signing nanopub', error);
      throw error;
    }
  }

  async publishInternal(signed: string) {
    const nanopub = new Nanopub(signed);

    let stop: boolean = false;
    let serverIx = 0;

    let published: Nanopub | undefined = undefined;

    while (!stop) {
      try {
        if (serverIx < this.config.servers.length) {
          published = await nanopub.publish(
            undefined,
            this.config.servers[serverIx]
          );
          stop = true;
        } else {
          stop = true;
        }
      } catch (error) {
        logger.error(
          `Error publishing nanopub from ${this.config.servers[serverIx]}, retrying`,
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

  async update(
    postPublish: PlatformPostUpdate<any>,
    _manager: TransactionManager
  ) {
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

  convertToGeneric(platformPost: PlatformPost<any>): Promise<GenericThread> {
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
