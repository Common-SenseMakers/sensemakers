import { expect } from 'chai';
import { anything, capture, verify } from 'ts-mockito';

import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { PlatformPostPosted } from '../../src/@shared/types/types.platform.posts';
import { GenericPost } from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { AppUser } from '../../src/@shared/types/types.user';
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
import {
  USE_REAL_EMAIL,
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

const DEBUG_PREFIX = `030-process`;
const DEBUG = false;

describe('060-send-digest-no-autpost', () => {
  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    let user: AppUser | undefined;
    let threads: PlatformPostPosted<TwitterThread>[];

    before(async () => {
      const testUser = testCredentials[0];
      user = await _01_createAndFetchUsers(services, testUser.twitter.id, {
        DEBUG,
        DEBUG_PREFIX,
      });
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
      const emailMock = services.emailMock;
      if (!emailMock) {
        throw new Error('notificationsMock not created');
      }

      verify(emailMock.sendUserDigest(anything(), anything())).once();

      const [capturedUser, capturedPosts] = capture(
        emailMock.sendUserDigest
      ).last();

      expect(capturedUser.userId).to.equal(userId);
      expect(capturedPosts).to.have.length(3);

      const expectedContents = threads.map((thread) => {
        return PostsHelper.concatenateThread({
          thread: thread.post.tweets.map((tweet): GenericPost => {
            return {
              content: tweet.text,
            };
          }),
        });
      });

      threads.forEach((_thread, ix) => {
        const post = capturedPosts[ix];
        expect(post).to.not.be.undefined;
        expect(expectedContents).to.include(post.content);
      });
    });
  });
});
