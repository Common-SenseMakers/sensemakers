import { expect } from 'chai';

import {
  ACTIVITY_EVENT_TYPE,
  NOTIFICATION_FREQUENCY,
  Notification,
} from '../../src/@shared/types/types.notifications';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../src/@shared/types/types.user';
import { USE_REAL_NOTIFICATIONS } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { ActivityRepository } from '../../src/notifications/activity.repository';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
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

describe.only('060-notifications', () => {
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

    it('marks the activity event as notified after sending notification', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      await services.users.updateSettings(user.userId, {
        autopost: { [PLATFORM.Nanopub]: { value: AutopostOption.MANUAL } },
        notificationFrequency: NOTIFICATION_FREQUENCY.Instant,
      });

      const activityRepo = new ActivityRepository(services.db);
      const createdActivity = await services.db.run(async (manager) => {
        const activity = activityRepo.create(
          {
            userId: user!.userId,
            type: ACTIVITY_EVENT_TYPE.PostsParsed,
            timestamp: Date.now(),
            involvedDocuments: {},
            notified: false,
            message: 'You have 1 new nanopublication',
          },
          manager
        );
        return activity;
      });
      const notificationObject: Notification = {
        userId: user.userId,
        activityEventIds: [createdActivity.id],
        activityEventType: ACTIVITY_EVENT_TYPE.PostsParsed,
        title: 'Posts Ready For Review',
        body: `You have 1 potential nanopublications ready for review!`,
      };
      await services.notifications.sendNotification(notificationObject);

      const updatedActivity = await services.db.run(async (manager) => {
        const activity = await activityRepo.get(
          createdActivity.id,
          manager,
          true
        );
        return activity;
      });
      expect(updatedActivity.notified).to.be.true;
    });
  });
});
