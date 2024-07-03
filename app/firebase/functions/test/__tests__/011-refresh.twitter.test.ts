import { expect } from 'chai';

import { TwitterUserDetails } from '../../src/@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { GetClientResultInternal } from '../../src/platforms/twitter/twitter.service.client';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe.skip('011-twitter refresh', () => {
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
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
          UsersHelper.getAccount(u, PLATFORM.Twitter, testUser.twitter.id) !==
          undefined
      );
    });
  });

  describe('refresh token manually', () => {
    it('refresh token', async () => {
      const twitterService = (services.platforms as any).platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;

      const account = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const account = UsersHelper.getAccount(
          user,
          PLATFORM.Twitter,
          undefined,
          true
        );

        return account;
      });

      let expectedDetails: TwitterUserDetails | undefined = undefined;

      await services.db.run(async (manager) => {
        (services.time as any).set(account?.read.expiresAtMs);

        const { client, oldDetails, newDetails } = (await (
          twitterService as any
        ).getUserClientInternal(
          account.user_id,
          'read',
          manager
        )) as GetClientResultInternal;

        expect(client).to.not.be.undefined;

        expectedDetails = newDetails;

        logger.debug(`oldDetails, newDetails`, { oldDetails, newDetails });
      });

      await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user.userId,
          manager,
          true
        );

        const accountRead = UsersHelper.getAccount(
          userRead,
          PLATFORM.Twitter,
          account.user_id
        );

        expect(accountRead?.read.refreshToken).to.equal(
          expectedDetails?.read?.refreshToken
        );

        logger.debug(`accountRead`, { accountRead });
      });

      expect(user).to.not.be.undefined;
    });
  });

  describe.skip('refresh token through getOfUser', () => {
    it('refresh token', async () => {
      if (!user) {
        throw new Error('unexpected');
      }

      /** read the expireTime */
      const account = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user.userId,
          manager,
          true
        );

        return UsersHelper.getAccount(
          userRead,
          PLATFORM.Twitter,
          undefined,
          true
        );
      });

      logger.debug(`-- TEST -- account ${account.read?.refreshToken}`, {
        account,
      });

      /** set the mock time service time to that value */
      (services.time as any).set(account.read?.expiresAtMs);

      // call getOfUsers (this should update the refresh token)
      void (await services.postsManager.getOfUser(user?.userId));

      const accountAfter = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user.userId,
          manager,
          true
        );

        return UsersHelper.getAccount(
          userRead,
          PLATFORM.Twitter,
          undefined,
          true
        );
      });

      logger.debug(
        `-- TEST -- accountAfter ${accountAfter.read?.refreshToken}`,
        {
          accountAfter,
        }
      );

      expect(account.read?.refreshToken).to.not.equal(
        accountAfter.read?.refreshToken
      );
    });
  });
});
