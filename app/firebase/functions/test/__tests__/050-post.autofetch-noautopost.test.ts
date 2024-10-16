import { expect } from 'chai';

import { ActivityType } from '../../src/@shared/types/types.activity';
import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import {
  PlatformPostPosted,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  PostsQueryStatus,
} from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { triggerAutofetchPosts } from '../../src/posts/tasks/posts.autofetch.task';
import { resetDB } from '../utils/db';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
} from './reusable/create-post-fetch';
import { updateUserSettings } from './reusable/update.settings';
import { TEST_THREADS, USE_REAL_TWITTER, globalTestServices } from './setup';
import { testCredentials } from './test.accounts';

const DEBUG_PREFIX = `030-process`;
const DEBUG = false;

describe('050-autofetch-no-autopost', () => {
  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    let user: AppUser | undefined;
    let thread: PlatformPostPosted<TwitterThread>;

    before(async () => {
      const testUser = testCredentials[0];
      user = await _01_createAndFetchUsers(
        globalTestServices,
        PLATFORM.Twitter,
        testUser.twitter.id,
        {
          DEBUG,
          DEBUG_PREFIX,
        }
      );
    });

    it('upates user autopost settings', async () => {
      await updateUserSettings(
        globalTestServices,
        {
          notificationFreq: NotificationFreq.Daily,
        },
        user
      );
    });

    it('publish a tweet in the name of the test user', async () => {
      const TEST_CONTENT = `This is a test post ${USE_REAL_TWITTER ? Date.now() : ''}`;
      thread = (await _02_publishTweet(globalTestServices, TEST_CONTENT, user))
        .post;
    });

    it('fetch user posts and check notifications', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      /**
       * simulate the cron JOB
       * it will trigger autopost tasks for each parsed post whose user has autopost enabled
       * */
      await triggerAutofetchPosts(globalTestServices);

      /** read user posts */
      const postsRead = await globalTestServices.postsManager.getOfUser({
        userId: user.userId,
        status: PostsQueryStatus.DRAFTS,
        fetchParams: { expectedAmount: TEST_THREADS.length + 1 + 6 },
      });
      expect(
        postsRead.filter((post) => post.origin === PLATFORM.Twitter)
      ).to.have.length(Math.ceil(TEST_THREADS.length / 2) + 1);

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
      await globalTestServices.db.run(async (manager) => {
        const notificationsIds =
          await globalTestServices.notifications.notificationsRepo.getUnotifiedOfUser(
            userId,
            manager
          );

        const userNotifications = await Promise.all(
          notificationsIds.map(async (pendingId) => {
            const notification =
              await globalTestServices.notifications.notificationsRepo.get(
                userId,
                pendingId,
                manager,
                true
              );

            return globalTestServices.notifications.getFull(
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
