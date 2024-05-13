import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import {
  PlatformPostDraftApprova,
  PlatformPostPosted,
} from '../../src/@shared/types/types.platform.posts';
import { AppPostReviewStatus } from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { parsePostTask } from '../../src/posts/posts.task';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

describe('030-process', () => {
  let rsaKeys: RSAKeys | undefined;
  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    let user: AppUser | undefined;
    let TEST_CONTENT = `This is a test post ${Date.now()}`;
    let thread: PlatformPostPosted<TwitterThread>;

    before(async () => {
      await services.db.run(async (manager) => {
        const users = await createUsers(
          services,
          Array.from(testUsers.values()),
          manager
        );
        user = users.find(
          (u) =>
            UsersHelper.getAccount(
              u,
              PLATFORM.Twitter,
              TWITTER_USER_ID_MOCKS
            ) !== undefined
        );
      });

      /**
       * fetch once to get the posts once and set the fetchedDetails of
       * the account
       */
      await services.db.run(async (manager) => {
        if (!user) throw new Error('user not created');
        /** fetch will store the posts in the DB */
        await services.postsManager.fetchUser(
          {
            userId: user.userId,
            params: { expectedAmount: 10 },
          },
          manager
        );
      });
    });

    /** skip for now because we have not yet granted write access */
    it('publish a post in the name of the test user', async () => {
      await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('user not created');
        }

        const accounts = user[PLATFORM.Twitter];
        if (!accounts) {
          throw new Error('Unexpected');
        }
        const account = accounts[0];
        if (!account) {
          throw new Error('Unexpected');
        }

        thread = await services.platforms
          .get<TwitterService>(PLATFORM.Twitter)
          .publish(
            {
              draft: { text: TEST_CONTENT },
              userDetails: account,
            },
            manager
          );

        expect(thread).to.not.be.undefined;

        if (USE_REAL_TWITTER) {
          await new Promise<void>((resolve) => setTimeout(resolve, 6 * 1000));
        }
      });
    });

    it('fetch user posts from all platforms', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      /**
       * fetch user posts. This time should return only the
       * newly published post
       */
      await services.postsManager.fetchUser({
        userId: user.userId,
        params: { expectedAmount: 10 },
      });

      /** read user post */
      const postsRead = await services.postsManager.getOfUser(user.userId);

      expect(postsRead).to.not.be.undefined;

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

      if (!user) {
        throw new Error('user not created');
      }

      expect(postRead).to.not.be.undefined;
    });

    it('triggers parse user posts task', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      const posts = await services.postsManager.getOfUser(user.userId);
      await Promise.all(
        posts.map((post) => {
          return parsePostTask({ data: { postId: post.id } } as any);
        })
      );

      /** wait for the task to finish */
      await new Promise<void>((resolve) => setTimeout(resolve, 0.5 * 1000));

      const postsRead = await services.postsManager.getOfUser(user.userId);

      expect(postsRead).to.not.be.undefined;

      postsRead.forEach((postRead) => {
        expect(postRead.semantics).to.not.be.undefined;
        expect(postRead.originalParsed).to.not.be.undefined;
        expect(postRead.parsedStatus).to.eq('processed');
      });
    });

    it('fetch one user pending posts', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      /** get pending posts of user */
      const pendingPosts = await services.postsManager.getOfUser(user.userId);

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
      await services.postsManager.approvePost(pendingPost, user.userId);

      const approved = await services.postsManager.getPost(
        pendingPost.id,
        true
      );

      expect(approved).to.not.be.undefined;
      expect(approved.reviewedStatus).to.equal(AppPostReviewStatus.APPROVED);
    });
  });
});
