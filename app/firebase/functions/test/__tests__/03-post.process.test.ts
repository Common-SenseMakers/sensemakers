import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types';
import { logger } from '../../src/instances/logger';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { resetDB } from '../__tests_support__/db';
import { services } from './test.services';

const TWITTER_ACCOUNT = 'sensemakergod';

const TEST_TOKENS_MAP = JSON.parse(
  process.env.TEST_USERS_BEARER_TOKENS as string
);

describe('process', () => {
  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    before(async () => {
      /** store some real twitter users in the DB */
      const users: AppUser[] = [TWITTER_ACCOUNT].map((handle): AppUser => {
        const user_id = TEST_TOKENS_MAP[handle].user_id;
        const userId = getPrefixedUserId(PLATFORM.Twitter, user_id);
        return {
          userId,
          platformIds: [userId],
          twitter: [
            {
              user_id,
              signupDate: 0,
              write: {
                accessToken: TEST_TOKENS_MAP[handle].accessToken,
                expiresIn: 0,
                expiresAtMs: 9712132755509,
                refreshToken: '',
              },
              read: {
                accessToken: TEST_TOKENS_MAP[handle].accessToken,
                expiresIn: 0,
                expiresAtMs: 9712132755509,
                refreshToken: '',
                lastFetchedMs: 0,
              },
            },
          ],
        };
      });

      await Promise.all(
        users.map((user) => services.users.repo.createUser(user.userId, user))
      );

      /** wait for just a second */
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    });

    it('publish a post in the name of the test user', async () => {
      const user_id = TEST_TOKENS_MAP[TWITTER_ACCOUNT].user_id;

      const user = await services.users.repo.getUserWithPlatformAccount(
        PLATFORM.Twitter,
        user_id,
        true
      );

      const accounts = user[PLATFORM.Twitter];
      if (!accounts) {
        throw new Error('Unexpected');
      }
      const account = accounts[0];
      if (!account) {
        throw new Error('Unexpected');
      }

      const tweets = await services.platforms.get(PLATFORM.Twitter).publish([
        {
          post: {
            id: '',
            authorId: '',
            content: `This is a test post ${Date.now()}`,
            mirrors: {},
            origin: PLATFORM.Local,
            parseStatus: 'unprocessed',
            reviewedStatus: 'pending',
          },
          userDetails: account,
        },
      ]);

      const tweet = tweets[0];

      /** set lastFetched to one second before the last tweet timestamp */
      await services.users.repo.setLastFetched(
        PLATFORM.Twitter,
        user_id,
        tweet.timestampMs - 1000
      );

      expect(tweet).to.not.be.undefined;

      /** wait for just a second */
      await new Promise<void>((resolve) => setTimeout(resolve, 10000));
    });

    it('fetch all posts from all platforms', async () => {
      /**
       * high-level trigger to process all new posts from
       * all registered users
       */
      await services.posts.process();
      console.log('done');
    });
  });
});
