import { expect } from 'chai';

import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import {
  PlatformPostPosted,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
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
import { TEST_THREADS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { triggerAutofetchPosts } from '../../src/posts/tasks/posts.autofetch.task';
import { resetDB } from '../utils/db';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
} from './reusable/create-post-fetch';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
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
      user = await _01_createAndFetchUsers(services, { DEBUG, DEBUG_PREFIX });
    });

    it('upates user autopost settings', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      await services.users.updateSettings(user.userId, {
        autopost: { [PLATFORM.Nanopub]: { value: AutopostOption.AI } },
        notificationFreq: NotificationFreq.None,
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
      thread = await _02_publishTweet(services, user);
    });

    it('fetch user posts from all platforms', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      /**
       * simulate the cron JOB
       * it will trigger autopost tasks for each parsed post whose user has autopost enabled
       * */
      await triggerAutofetchPosts();

      /** read user posts */
      const postsRead = await services.postsManager.getOfUser(user.userId);
      expect(postsRead).to.have.length(TEST_THREADS.length + 1);

      const postOfThread2 = postsRead.find((p) =>
        p.mirrors.find(
          (m) =>
            m.platformId === PLATFORM.Twitter &&
            m.posted?.post_id === thread.post_id
        )
      );

      if (!postOfThread2) {
        throw new Error('post not found');
      }

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
