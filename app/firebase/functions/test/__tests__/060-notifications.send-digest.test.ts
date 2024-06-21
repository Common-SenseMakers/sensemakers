import { expect } from 'chai';
import { capture, verify } from 'ts-mockito';

import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { PlatformPostPosted } from '../../src/@shared/types/types.platform.posts';
import { GenericPost } from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { AppUser } from '../../src/@shared/types/types.user';
import { USE_REAL_NOTIFICATIONS } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { triggerSendNotifications } from '../../src/notifications/notification.task';
import { PostsHelper } from '../../src/posts/posts.helper';
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

describe.only('060-send-digest-no-autpost', () => {
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
    let threads: PlatformPostPosted<TwitterThread>[];

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
      /** publish 3 tweets */
      threads = await Promise.all(
        [0, 1, 2].map((v) => {
          const TEST_CONTENT = `This is a test post ${v} ${USE_REAL_TWITTER ? Date.now() : ''}`;
          return _02_publishTweet(services, TEST_CONTENT, user);
        })
      );
    });

    it('fetch user posts - parsed', async () => {
      await triggerAutofetchPosts();

      // simulate daily cron job
      await triggerSendNotifications(NotificationFreq.Daily, services);

      if (!user) {
        throw new Error('user not created');
      }
      const userId = user.userId;

      /** check that the notifications were marked as disabled */
      await services.db.run(async (manager) => {
        const notificationsIds =
          await services.notifications.notificationsRepo.getUnotifiedOfUser(
            userId,
            manager
          );

        expect(notificationsIds).to.have.length(0);
      });

      /** check that the send digest was called with the posts contents */
      verify(services.notifications).once();

      const [capturedUserId, capturedPosts] = capture(
        services.notifications.sendDigest
      ).last();

      expect(capturedUserId).to.equal(userId);
      expect(capturedPosts).to.have.length(3);

      threads.forEach((thread, i) => {
        const post = capturedPosts[i];
        expect(post).to.not.be.undefined;
        expect(post.content).to.equal(
          PostsHelper.concatenateThread({
            thread: thread.post.tweets.map((tweet): GenericPost => {
              return {
                content: tweet.text,
              };
            }),
          })
        );
      });
    });
  });
});
