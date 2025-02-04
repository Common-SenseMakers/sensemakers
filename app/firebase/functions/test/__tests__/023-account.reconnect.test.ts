import { expect } from 'chai';

import { BlueskyCredentials } from '../../src/@shared/types/types.bluesky';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  AccountCredentials,
  AppUser,
} from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe.only('023 Account Reconnect', () => {
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    bluesky: USE_REAL_BLUESKY
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    mastodon: USE_REAL_MASTODON
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    await services.db.run(async (manager) => {
      const users = await createUsers(
        services,
        Array.from(testUsers.values()),
        manager
      );
      const testUser = testCredentials[0];

      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Bluesky, testUser.bluesky.id) !==
          undefined
      );
    });
  });
  it('marks an account as disconnected if the client fails to instantiate', async () => {
    if (!user) {
      throw new Error('appUser not created');
    }
    const allUserDetails = user.accounts[PLATFORM.Bluesky];
    if (!allUserDetails || allUserDetails.length < 0) {
      throw new Error('Unexpected');
    }
    const userDetails = allUserDetails[0];
    const testUser = testCredentials[0];
    const wrongCredentials = {
      read: {
        session: {
          refreshJwt: '1234',
          accessJwt: '1234',
          handle: testUser.bluesky.username,
          did: testUser.bluesky.id,
          active: true,
        },
        credentials: {
          identifier: testUser.bluesky.id,
          password: 'wrong-password',
        },
      },
    } as AccountCredentials<BlueskyCredentials, BlueskyCredentials>;

    await services.db.run(async (manager) => {
      return services.users.updateAccountCredentials(
        user!.userId,
        PLATFORM.Bluesky,
        userDetails.user_id,
        wrongCredentials,
        manager
      );
    });

    await services.db.run(async (manager) => {
      return services.postsManager.fetchAccount(
        PLATFORM.Bluesky,
        userDetails.user_id,
        {
          expectedAmount: 1,
        },
        manager,
        wrongCredentials,
        user!.userId
      );
    });

    const appUserRead = await services.db.run(async (manager) => {
      return services.users.getLoggedUserWithProfiles(user!.userId, manager);
    });

    expect(appUserRead.profiles[PLATFORM.Bluesky]?.[0].isDisconnected).to.be
      .true;
  });
});
