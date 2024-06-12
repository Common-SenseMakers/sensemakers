import { expect } from 'chai';

import {
  PlatformPostPosted,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPostParsedStatus,
  AppPostRepublishedStatus,
} from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { triggerAutofetchPosts } from '../../src/posts/tasks/posts.autofetch.task';
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

const DEBUG_PREFIX = `030-process`;
const DEBUG = false;

describe.only('050-autopost', () => {
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
    let thread: PlatformPostPosted<TwitterThread>;

    before(async () => {
      await services.db.run(async (manager) => {
        const users = await createUsers(
          services,
          Array.from(testUsers.values()),
          manager
        );
        if (DEBUG)
          logger.debug(`users crated ${users.length}`, { users }, DEBUG_PREFIX);
        user = users.find(
          (u) =>
            UsersHelper.getAccount(
              u,
              PLATFORM.Twitter,
              TWITTER_USER_ID_MOCKS
            ) !== undefined
        );
        if (DEBUG)
          logger.debug(`test user ${user?.userId}`, { user }, DEBUG_PREFIX);
      });

      /**
       * fetch once to get the posts once and set the fetchedDetails of
       * the account
       */

      if (!user) throw new Error('user not created');
      if (DEBUG) logger.debug(` ${user?.userId}`, { user }, DEBUG_PREFIX);
      /** fetch will store the posts in the DB */
      await services.postsManager.fetchUser({
        userId: user.userId,
        params: { expectedAmount: 10 },
      });
    });

    it('publish a tweet in the name of the test user', async () => {
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

        const TEST_CONTENT = `This is a test post ${USE_REAL_TWITTER ? Date.now() : ''}`;

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

      /** simulate the cron JOB */
      await triggerAutofetchPosts();

      logger.debug('autofetch and post chain - waiting', DEBUG_PREFIX);
      await new Promise<void>((resolve) => setTimeout(resolve, 5 * 1000));

      logger.debug('autofetch and post chain - checking', DEBUG_PREFIX);

      /** read user post */
      const postsRead = await services.postsManager.getOfUser(user.userId);

      expect(postsRead).to.have.length(2);
      expect(postsRead).to.have.length(2);

      const postOfThread = postsRead.find((post) =>
        post.mirrors.find(
          (m) =>
            m.platformId === PLATFORM.Twitter &&
            m.posted?.post_id === thread.post_id
        )
      );

      expect(postOfThread).to.not.be.undefined;

      if (!postOfThread) {
        throw new Error('postOfThread not created');
      }

      expect(postOfThread.semantics).to.be.undefined;
      expect(postOfThread.originalParsed).to.be.undefined;

      expect(postOfThread.parsedStatus).to.eq(AppPostParsedStatus.PROCESSED);
      expect(postOfThread.republishedStatus).to.eq(
        AppPostRepublishedStatus.REPUBLISHED
      );

      const nanopub = postOfThread?.mirrors.find(
        (m) => m.platformId === PLATFORM.Nanopub
      );

      if (!nanopub) {
        throw new Error('tweetRead not created');
      }

      expect(nanopub.posted).to.not.be.undefined;
      expect(nanopub.publishStatus).to.eq(PlatformPostPublishStatus.PUBLISHED);
    });
  });
});
