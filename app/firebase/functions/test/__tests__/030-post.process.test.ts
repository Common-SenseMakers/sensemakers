import { expect } from 'chai';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { SciFilterClassfication } from '../../src/@shared/types/types.parser';
import {
  PlatformPostCreate,
  PlatformPostDraftApprova,
  PlatformPostPosted,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPostCreate,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostsQueryStatusParam,
} from '../../src/@shared/types/types.posts';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { parseUserPostsTask } from '../../src/posts/posts.task';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createTestAppUsers } from '../utils/user.factory';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe('030-process', () => {
  let rsaKeys: RSAKeys | undefined;
  const services = getTestServices({
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    let appUser: AppUser | undefined;
    let TEST_CONTENT = `This is a test post ${Date.now()}`;
    let tweet: PlatformPostPosted<TweetV2SingleResult>;

    before(async () => {
      await services.db.run(async (manager) => {
        const users = await createTestAppUsers(services, manager);

        /**
         * Use @sense_nets_bot. Used also in Twitter Mock and part of
         * test users
         */
        appUser = users.find(
          (u) =>
            UsersHelper.getAccount(
              u,
              PLATFORM.Twitter,
              TWITTER_USER_ID_MOCKS
            ) !== undefined
        );

        rsaKeys = getRSAKeys('');
      });
    });

    /** skip for now because we have not yet granted write access */
    it('publish a post in the name of the test user', async () => {
      await services.db.run(async (manager) => {
        if (!appUser) {
          throw new Error('appUser not created');
        }
        const user_id = appUser[PLATFORM.Twitter]?.[0].user_id;
        if (!user_id) {
          throw new Error('Unexpected');
        }

        const user = await services.users.repo.getUserWithPlatformAccount(
          PLATFORM.Twitter,
          user_id,
          manager,
          true
        );

        const accounts = user[PLATFORM.Twitter];
        if (!accounts) {
          throw new Error('Unexpected');
        }
        const account = accounts[0];
        if (!account) {
          throw new Error('Unexpected');
        }

        tweet = await services.platforms
          .get<TwitterService>(PLATFORM.Twitter)
          .publish(
            {
              draft: { text: TEST_CONTENT },
              userDetails: account,
            },
            manager
          );

        /** set lastFetched to one second before the last tweet timestamp */
        await services.users.repo.setAccountFetched(
          PLATFORM.Twitter,
          user_id,
          { newestId: tweet.post_id },
          manager
        );

        expect(tweet).to.not.be.undefined;

        if (USE_REAL_TWITTER) {
          await new Promise<void>((resolve) => setTimeout(resolve, 6 * 1000));
        }
      });
    });

    it('fetch user posts from all platforms', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }

      /** fetch user posts */
      await services.postsManager.fetchUser({
        userId: appUser.userId,
        params: { expectedAmount: 10 },
      });

      /** read user post */
      const postsRead = await services.postsManager.getOfUser(appUser.userId);

      expect(postsRead).to.not.be.undefined;
      expect(postsRead).to.have.length(1);

      const postRead = postsRead[0];
      expect(postRead).to.not.be.undefined;
      expect(postRead.mirrors).to.have.length(1);

      expect(postRead.semantics).to.be.undefined;
      expect(postRead.originalParsed).to.be.undefined;

      const tweetRead = postRead.mirrors.find(
        (m) => m.platformId === PLATFORM.Twitter
      );

      if (!tweetRead) {
        throw new Error('tweetRead not created');
      }

      if (!appUser) {
        throw new Error('appUser not created');
      }

      expect(postRead).to.not.be.undefined;
    });

    it('triggers parse user posts task', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      await parseUserPostsTask({ data: { userId: appUser.userId } } as any);

      /** wait for the task to finish */
      await new Promise<void>((resolve) => setTimeout(resolve, 0.5 * 1000));

      const postsRead = await services.postsManager.getOfUser(appUser.userId);

      expect(postsRead).to.not.be.undefined;
      expect(postsRead).to.have.length(1);

      postsRead.forEach((postRead) => {
        expect(postRead.semantics).to.not.be.undefined;
        expect(postRead.originalParsed).to.not.be.undefined;
        expect(postRead.parsedStatus).to.eq('processed');
      });
    });

    it('fetch one user pending posts', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }

      /** get pending posts of user */
      const pendingPosts = await services.postsManager.getOfUser(
        appUser.userId
      );

      expect(pendingPosts).to.have.length(1);
      const pendingPost = pendingPosts[0];
      const nanopub = pendingPost.mirrors.find(
        (m) => m.platformId === PLATFORM.Nanopub
      );

      if (!nanopub?.draft) {
        throw new Error('draft not created');
      }

      const draft = nanopub.draft.post;

      if (!rsaKeys) {
        throw new Error('draft not created');
      }

      /** sign */
      const signed = await signNanopublication(draft, rsaKeys, '');
      nanopub.draft.post = signed.rdf();
      nanopub.draft.postApproval = PlatformPostDraftApprova.APPROVED;

      /** send updated post (content and semantics did not changed) */
      await services.postsManager.approvePost(pendingPost, appUser.userId);

      const approved = await services.postsManager.getPost(
        pendingPost.id,
        true
      );

      expect(approved).to.not.be.undefined;
      expect(approved.reviewedStatus).to.equal('reviewed');
    });
  });
});
