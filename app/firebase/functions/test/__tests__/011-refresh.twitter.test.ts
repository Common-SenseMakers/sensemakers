import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
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
import { getTestServices } from './test.services';

describe.only('011-twitter refresh', () => {
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
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
      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Twitter, TWITTER_USER_ID_MOCKS) !==
          undefined
      );
    });
  });

  describe('refresh token manually', () => {
    it('refresh token', async () => {
      const twitterService = (services.platforms as any).platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;

      await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const account = UsersHelper.getAccount(user, PLATFORM.Twitter);

        if (!account) {
          throw new Error('unexpected');
        }

        (services.time as any).set(account?.read.expiresAtMs);

        const { client, oldDetails, newDetails } = (await (
          twitterService as any
        ).getUserClientInternal(
          account.user_id,
          'read',
          manager
        )) as GetClientResultInternal;

        logger.debug(`oldDetails, newDetails`, { oldDetails, newDetails });

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
          newDetails?.read?.refreshToken
        );

        logger.debug(`accountRead`, { accountRead });

        expect(client).to.not.be.undefined;
      });

      expect(user).to.not.be.undefined;
    });
  });

  describe('refresh token through getOfUser', () => {
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
