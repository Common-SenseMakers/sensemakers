import { expect } from 'chai';

import { ActivityType } from '../../src/@shared/types/types.activity';
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
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { USE_REAL_NOTIFICATIONS } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { TEST_THREADS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { triggerAutofetchPosts } from '../../src/posts/tasks/posts.autofetch.task';
import { resetDB } from '../utils/db';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
} from './reusable/create-post-fetch';
import { updateUserSettings } from './reusable/update.settings';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

const DEBUG_PREFIX = `030-process`;
const DEBUG = false;

describe('050-autofetch-no-autopost', () => {
  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    notifications: USE_REAL_NOTIFICATIONS ? 'spy' : 'mock',
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
      await updateUserSettings(
        services,
        {
          notificationFreq: NotificationFreq.Daily,
        },
        user
      );
    });

    it('publish a tweet in the name of the test user', async () => {
      const TEST_CONTENT = `This is a test post ${USE_REAL_TWITTER ? Date.now() : ''}`;
      thread = await _02_publishTweet(services, TEST_CONTENT, user);
    });

    it('fetch user posts - parsed', async () => {
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
        AppPostRepublishedStatus.PENDING
      );

      const nanopub = postOfThread2?.mirrors.find(
        (m) => m.platformId === PLATFORM.Nanopub
      );

      if (!nanopub) {
        throw new Error('tweetRead not created');
      }

      expect(nanopub.posted).to.be.undefined;
      expect(nanopub.draft).to.not.be.undefined;

      expect(nanopub.publishStatus).to.eq(PlatformPostPublishStatus.DRAFT);

      if (!user) {
        throw new Error('user not created');
      }
      const userId = user.userId;

      /** check the notitication for the user was created */
      await services.db.run(async (manager) => {
        const notificationsIds =
          await services.notifications.notificationsRepo.getUnotifiedOfUser(
            userId,
            manager
          );

        const userNotifications = await Promise.all(
          notificationsIds.map(async (pendingId) => {
            const notification =
              await services.notifications.notificationsRepo.get(
                userId,
                pendingId,
                manager,
                true
              );

            return services.notifications.getFull(
              userId,
              notification.id,
              manager
            );
          })
        );

        expect(userNotifications).to.have.length(1);
        const notification = userNotifications[0];

        if (!notification) {
          throw new Error('autopostNotification not found');
        }

        expect(notification.activity.data.postId).to.eq(postOfThread2.id);

        expect(notification.activity.type).to.eq(ActivityType.PostParsed);
      });
    });
  });
});
