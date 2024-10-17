import { expect } from 'chai';

import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppPostParsingStatus } from '../../src/@shared/types/types.posts';
import { AppUser, AutopostOption } from '../../src/@shared/types/types.user';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { Services } from '../../src/instances/services';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { fetchPostInTests } from '../utils/posts.utils';
import { createUsers } from '../utils/users.utils';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
  _03_fetchAfterPublish,
} from './reusable/create-post-fetch';
import { updateUserSettings } from './reusable/update.settings';
import {
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

const fetchAndGetNotifications = async (
  post_id: string,
  userId: string,
  services: Services
) => {
  const { postsManager } = services;

  if (!post_id) {
    throw new Error('post_id not defined');
  }

  const post = await fetchPostInTests(
    userId,
    post_id,
    services,
    PLATFORM.Twitter
  );

  if (!post) {
    throw new Error('post undefined');
  }

  const parsedPost = await postsManager.getPost(post.id, true);
  expect(parsedPost).to.not.be.undefined;
  expect(parsedPost.parsingStatus).to.equal(AppPostParsingStatus.IDLE);
  expect(parsedPost.semantics).to.not.be.undefined;

  /** check that the notifications were marked as disabled */
  return await services.db.run(
    async (manager) => {
      const notificationsIds =
        await services.notifications.notificationsRepo.getUnotifiedOfUser(
          userId,
          manager
        );

      return notificationsIds;
    },
    undefined,
    undefined,
    'getUnotifiedOfUser'
  );
};

describe('061 parse tweet, ', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
  });

  describe('get and process', () => {
    let user: AppUser | undefined;

    describe('manual no-notifications', async () => {
      before(async () => {
        logger.debug('resetting DB');
        await resetDB([[''], [''], [''], [''], ['']], [testCredentials[0]]);

        const users = await services.db.run((manager) => {
          return createUsers(services, testUsers, manager);
        });

        user = users.find(
          (u) =>
            UsersHelper.getAccount(
              u,
              PLATFORM.Twitter,
              '1753077743816777728'
            ) !== undefined
        );

        if (!user) {
          throw new Error('user not created');
        }

        await updateUserSettings(
          services,
          {
            autopost: { [PLATFORM.Nanopub]: { value: AutopostOption.MANUAL } },
            notificationFreq: NotificationFreq.None,
          },
          user
        );
      });

      it('citoid', async () => {
        // const post_id = '0'; // AI detected
        const post_id = '1'; // citoid research
        // const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(0);
      });

      it('ai', async () => {
        const post_id = '0'; // AI detected
        // const post_id = '1'; // citoid research
        // const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(0);
      });

      it('not research', async () => {
        // const post_id = '0'; // AI detected
        // const post_id = '1'; // citoid research
        const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(0);
      });
    });

    describe('manual daily-notifications', async () => {
      before(async () => {
        logger.debug('resetting DB');
        await resetDB([[''], [''], [''], [''], ['']], [testCredentials[0]]);

        const users = await services.db.run((manager) => {
          return createUsers(services, testUsers, manager);
        });
        user = users.find(
          (u) =>
            UsersHelper.getAccount(
              u,
              PLATFORM.Twitter,
              '1753077743816777728'
            ) !== undefined
        );

        if (!user) {
          throw new Error('user not created');
        }

        await updateUserSettings(
          services,
          {
            autopost: { [PLATFORM.Nanopub]: { value: AutopostOption.MANUAL } },
            notificationFreq: NotificationFreq.Daily,
          },
          user
        );
      });

      it('citoid', async () => {
        // const post_id = '0'; // AI detected
        const post_id = '1'; // citoid research
        // const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(1);
      });

      it('ai', async () => {
        const post_id = '0'; // AI detected
        // const post_id = '1'; // citoid research
        // const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(1);
      });

      it('not research', async () => {
        // const post_id = '0'; // AI detected
        // const post_id = '1'; // citoid research
        const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(1);
      });
    });

    describe('autopost daily-notifications', async () => {
      before(async () => {
        logger.debug('resetting DB');
        await resetDB([[''], [''], [''], [''], ['']], [testCredentials[0]]);

        const users = await services.db.run((manager) => {
          return createUsers(services, testUsers, manager);
        });

        user = users.find(
          (u) =>
            UsersHelper.getAccount(
              u,
              PLATFORM.Twitter,
              '1753077743816777728'
            ) !== undefined
        );

        if (!user) {
          throw new Error('user not created');
        }

        await updateUserSettings(
          services,
          {
            autopost: {
              [PLATFORM.Nanopub]: { value: AutopostOption.DETERMINISTIC },
            },
            notificationFreq: NotificationFreq.Daily,
          },
          user
        );
      });

      it('citoid', async () => {
        // const post_id = '0'; // AI detected
        const post_id = '1'; // citoid research
        // const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(2);
      });

      it('ai', async () => {
        const post_id = '0'; // AI detected
        // const post_id = '1'; // citoid research
        // const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(2);
      });

      it('not research', async () => {
        // const post_id = '0'; // AI detected
        // const post_id = '1'; // citoid research
        const post_id = '2'; // not research

        if (!user) {
          throw new Error('user not created');
        }
        const notificationsIds = await fetchAndGetNotifications(
          post_id,
          user.userId,
          services
        );
        expect(notificationsIds).to.have.length(2);
      });
    });
  });
});
