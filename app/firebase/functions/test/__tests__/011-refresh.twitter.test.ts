import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { GetClientResult } from '../../src/platforms/twitter/twitter.service.client';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import { USE_REAL_PARSER, USE_REAL_TWITTER, testUsers } from './setup';
import { getTestServices } from './test.services';

describe.only('011-twitter refresh', () => {
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

  describe('refresh token manually', () => {
    it('refresh token', async () => {
      if (!USE_REAL_TWITTER) {
        logger.debug(
          'skipping refresh token test. Enabled only with real twitter'
        );
        return;
      }
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

      (services.time as any).set(account?.credentials.read.expiresAtMs);

      const { client, credentials: newCredentials } = (await (
        twitterService as any
      ).getClient(account.credentials, 'read')) as GetClientResult<'read'>;

      expect(client).to.not.be.undefined;
      expect(newCredentials).to.be.undefined;

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

        expect(accountRead?.credentials).to.not.be.undefined;
        logger.debug(`accountRead`, { accountRead });

        return accountRead?.credentials;
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

      logger.debug(`account ${account.credentials.read?.refreshToken}`, {
        account,
      });

      /** set the mock time service time to that value */
      (services.time as any).set(account.credentials.read?.expiresAtMs);

      // call getOfUsers (this should update the refresh token)
      void (await services.postsManager.getOfUser({
        userId: user?.userId,
        fetchParams: { expectedAmount: 10 },
      }));

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
        `accountAfter ${accountAfter.credentials.read?.refreshToken}`,
        {
          accountAfter,
        }
      );

      expect(account.credentials.read?.refreshToken).to.not.equal(
        accountAfter.credentials.read?.refreshToken
      );
    });
  });

  describe('remove platform on invalid token', () => {
    it('removes platform', async () => {
      if (!USE_REAL_TWITTER) {
        logger.debug(
          'skipping refresh token test. Enabled only with real twitter'
        );
        return;
      }

      const twitterService = (services.platforms as any).platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;

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

      const tweetId = '1818267753016381936';

      const tweet = twitterService.getPost(tweetId, account.credentials.read);

      expect(tweet).to.not.be.undefined;

      (services.time as any).set(account?.credentials.read.expiresAtMs);

      const { client, credentials: secondCredentials } = (await (
        twitterService as any
      ).getClient(account.credentials, 'read')) as GetClientResult<'read'>;

      expect(client).to.not.be.undefined;
      expect(secondCredentials).to.not.be.undefined;

      logger.debug(`secondCredentials`, { secondCredentials });

      await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user?.userId,
          manager,
          true
        );

        const accountRead = UsersHelper.getAccount(
          userRead,
          PLATFORM.Twitter,
          account.user_id
        );

        expect(accountRead?.credentials.read.refreshToken).to.equal(
          secondCredentials?.refreshToken
        );

        logger.debug(`accountRead`, { accountRead });
      });

      // check refresh token is valid
      const tweet2 = twitterService.getPost(tweetId, secondCredentials);

      expect(tweet2).to.not.be.undefined;

      // corrupt the refresh token (this should not happen BTW...)
      //   await services.db.run(async (manager) => {
      //     const latestUser = await services.users.repo.getUser(
      //       userId,
      //       manager,
      //       true
      //     );

      //     const latestDetails = UsersHelper.getAccount(
      //       latestUser,
      //       PLATFORM.Twitter,
      //       account.user_id
      //     ) as TwitterUserDetails;

      //     if (!latestDetails.read) {
      //       throw new Error('unexpected read undefined');
      //     }

      //     const currentRefresh = latestDetails?.read?.refreshToken;

      //     if (!currentRefresh) {
      //       throw new Error('unexpected refresh token undefined');
      //     }
      //     const newRefresh = 'ABCD' + currentRefresh.slice(4);

      //     latestDetails.read.refreshToken = newRefresh;

      //     await services.users.repo.setPlatformDetails(
      //       userId,
      //       PLATFORM.Twitter,
      //       latestDetails,
      //       manager
      //     );
      //   });

      //   // check refresh token is not valid
      //   await services.db.run(async (manager) => {
      //     const latestUser = await services.users.repo.getUser(
      //       userId,
      //       manager,
      //       true
      //     );

      //     const latestDetails = UsersHelper.getAccount(
      //       latestUser,
      //       PLATFORM.Twitter,
      //       account.user_id
      //     ) as TwitterUserDetails;

      //     if (!latestDetails || !latestDetails.read) {
      //       throw new Error('unexpected');
      //     }

      //     (services.time as any).set(latestDetails.read.expiresAtMs);
      //   });

      //   // check refresh token is valid
      //   const { post } = await services.db.run(async (manager) =>
      //     services.postsManager.fetchPostFromPlatform(
      //       userId,
      //       PLATFORM.Twitter,
      //       tweetId,
      //       manager
      //     )
      //   );

      //   expect(post).to.be.undefined;
    });
  });
});
