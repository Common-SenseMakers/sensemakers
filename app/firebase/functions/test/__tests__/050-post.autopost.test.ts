import { expect } from 'chai';

import { NOTIFICATION_FREQUENCY } from '../../src/@shared/types/types.notifications';
import {
  PlatformPostPosted,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPost,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
} from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../src/@shared/types/types.user';
import { USE_REAL_NOTIFICATIONS } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { postUpdatedHook } from '../../src/posts/hooks/post.updated.hook';
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

describe('050-autopost', () => {
  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    notifications: USE_REAL_NOTIFICATIONS ? 'real' : 'mock',
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

    it('upates user autopost settings', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      await services.users.updateSettings(user.userId, {
        autopost: { [PLATFORM.Nanopub]: { value: AutopostOption.AI } },
        notificationFrequency: NOTIFICATION_FREQUENCY.None,
      });

      const userRead = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('user not created');
        }

        return services.users.repo.getUser(user.userId, manager, true);
      });

      expect(userRead.settings.autopost[PLATFORM.Nanopub].value).to.eq(
        AutopostOption.AI
      );
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

      /** simulate the cron JOB
       * it will trigger parse tasks for each fetched post
       * it will fetch the tweet and create a new AppPost */
      await triggerAutofetchPosts();

      /** read user posts */
      const postsRead = await services.postsManager.getOfUser(user.userId);
      expect(postsRead).to.have.length(2);

      const postOfThread1 = postsRead.find(
        (p) => p.origin === PLATFORM.Twitter
      );
      if (!postOfThread1) {
        throw new Error('postOfThread not created');
      }

      expect(postOfThread1.semantics).to.not.be.undefined;
      expect(postOfThread1.originalParsed).to.not.be.undefined;
      expect(postOfThread1.mirrors).to.have.length(2);
      expect(postOfThread1.parsingStatus).to.eq(AppPostParsingStatus.IDLE);
      expect(postOfThread1.parsedStatus).to.eq(AppPostParsedStatus.PROCESSED);
      expect(postOfThread1.republishedStatus).to.eq(
        AppPostRepublishedStatus.PENDING
      );

      /** simulate postUpdatedHook (should autopost the post )*/
      await postUpdatedHook(postOfThread1.id);
      const postOfThread2 = await services.postsManager.getPost(
        postOfThread1.id,
        true
      );

      expect(postOfThread2.semantics).to.not.be.undefined;
      expect(postOfThread2.originalParsed).to.not.be.undefined;
      expect(postOfThread2.mirrors).to.have.length(2);
      expect(postOfThread2.parsingStatus).to.eq(AppPostParsingStatus.IDLE);
      expect(postOfThread2.parsedStatus).to.eq(AppPostParsedStatus.PROCESSED);
      expect(postOfThread2.republishedStatus).to.eq(
        AppPostRepublishedStatus.AUTO_REPUBLISHED
      );

      const nanopub = postOfThread2?.mirrors.find(
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
