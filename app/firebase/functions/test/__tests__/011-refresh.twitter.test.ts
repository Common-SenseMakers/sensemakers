import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { TwitterAccountDetails } from '../../src/@shared/types/types.twitter';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import { USE_REAL_PARSER, USE_REAL_TWITTER, testUsers } from './setup';
import { getTestServices } from './test.services';

const tweetId1 = process.env.TEST_TWEET_ID_1;
const tweetId2 = process.env.TEST_TWEET_ID_2;
const tweetId3 = process.env.TEST_TWEET_ID_3;
const tweetId4 = process.env.TEST_TWEET_ID_4;

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

  describe('refresh token through fetchPost', () => {
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

      const tweet = await twitterService.getPost(
        tweetId1 as string,
        account1.credentials.read
      );
      expect(tweet).to.not.be.undefined;

      /** set the mock time service time to that value */
      (services.time as any).set(account1.credentials.read?.expiresAtMs);

      const result1 = await services.db.run((manager) => {
        if (!user) {
          throw new Error('unexpected');
        }
        return services.postsManager.fetchPostFromPlatform(
          user.userId,
          PLATFORM.Twitter,
          tweetId1 as string,
          manager
        );
      });

      expect(result1).to.not.be.undefined;

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
      const tweet2 = await twitterService.getPost(
        tweetId2 as string,
        account2.credentials.read
      );
      expect(tweet2).to.not.be.undefined;

      expect(account1.credentials.read?.refreshToken).to.not.equal(
        account2.credentials.read?.refreshToken
      );

      /** set the mock time service time to that value */
      (services.time as any).set(account2.credentials.read?.expiresAtMs);

      // call fetchPostFromPlatform (this should update the refresh token again)
      const result2 = await services.db.run((manager) => {
        if (!user) {
          throw new Error('unexpected');
        }
        return services.postsManager.fetchPostFromPlatform(
          user.userId,
          PLATFORM.Twitter,
          tweetId2 as string,
          manager
        );
      });

      expect(result2).to.not.be.undefined;

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

      const tweet3 = await twitterService.getPost(
        tweetId3 as string,
        account3.credentials.read
      );
      expect(tweet3).to.not.be.undefined;

      expect(account2.credentials.read?.refreshToken).to.not.equal(
        account3.credentials.read?.refreshToken
      );

      /** refresh worked, now corrupt and see if reset credentials */

      const userId = user.userId;

      /** corrupt the token */
      await services.db.run(async (manager) => {
        const latestUser = await services.users.repo.getUser(
          userId,
          manager,
          true
        );

        const latestDetails = UsersHelper.getAccount(
          latestUser,
          PLATFORM.Twitter,
          account3.user_id
        ) as TwitterAccountDetails;

        if (!latestDetails.credentials.read) {
          throw new Error('unexpected read undefined');
        }

        const currentRefresh = latestDetails?.credentials.read?.refreshToken;

        if (!currentRefresh) {
          throw new Error('unexpected refresh token undefined');
        }
        const newRefresh = 'ABCD' + currentRefresh.slice(4);

        latestDetails.credentials.read.refreshToken = newRefresh;

        await services.users.repo.setAccountDetails(
          userId,
          PLATFORM.Twitter,
          latestDetails,
          manager
        );

        (services.time as any).set(latestDetails.credentials.read.expiresAtMs);
      });

      // check refresh token is valid
      await services.db.run(async (manager) =>
        services.postsManager.fetchPostFromPlatform(
          userId,
          PLATFORM.Twitter,
          tweetId4 as string,
          manager
        )
      );

      const account4 = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user.userId,
          manager,
          true
        );

        return UsersHelper.getAccount(userRead, PLATFORM.Twitter, undefined);
      });

      expect(account4).to.be.undefined;
    });
  });
});
