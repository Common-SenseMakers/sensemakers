import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import { USE_REAL_PARSER, USE_REAL_TWITTER, testUsers } from './setup';
import { getTestServices } from './test.services';

describe('011-twitter refresh', () => {
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? undefined : { publish: true, signup: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    const users = await services.db.run(async (manager) => {
      return createUsers(services, testUsers, manager);
    });

    user = users.find(
      (u) => UsersHelper.getAccount(u, PLATFORM.Twitter) !== undefined
    );
  });

  describe('refresh token through getOfUser', () => {
    it('refresh token', async () => {
      if (!user) {
        throw new Error('unexpected');
      }

      const twitterService = (services.platforms as any).platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;

      /** read the expireTime */
      const account1 = await services.db.run(async (manager) => {
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

      logger.debug(`account ${account1.credentials.read?.refreshToken}`, {
        account: account1,
      });

      /** credentials should be valid */
      const tweetId = '1818267753016381936';
      const tweet = twitterService.getPost(tweetId, account1.credentials.read);
      expect(tweet).to.not.be.undefined;

      /** set the mock time service time to that value */
      (services.time as any).set(account1.credentials.read?.expiresAtMs);

      // call getOfUsers (this should update the refresh token)
      void (await services.postsManager.getOfUser({
        userId: user?.userId,
        fetchParams: { expectedAmount: 10 },
      }));

      const account2 = await services.db.run(async (manager) => {
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

      logger.debug(`accountAfter ${account2.credentials.read?.refreshToken}`, {
        accountAfter: account2,
      });

      /** new credentials should be valid */
      const tweet2 = twitterService.getPost(tweetId, account2.credentials.read);
      expect(tweet2).to.not.be.undefined;

      expect(account1.credentials.read?.refreshToken).to.not.equal(
        account2.credentials.read?.refreshToken
      );

      /** set the mock time service time to that value */
      (services.time as any).set(account2.credentials.read?.expiresAtMs);

      // call getOfUsers (this should update the refresh token again)
      void (await services.postsManager.getOfUser({
        userId: user?.userId,
        fetchParams: { expectedAmount: 10 },
      }));

      const account3 = await services.db.run(async (manager) => {
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

      const tweet3 = twitterService.getPost(tweetId, account3.credentials.read);
      expect(tweet3).to.not.be.undefined;

      expect(account2.credentials.read?.refreshToken).to.not.equal(
        account3.credentials.read?.refreshToken
      );
    });
  });
});
