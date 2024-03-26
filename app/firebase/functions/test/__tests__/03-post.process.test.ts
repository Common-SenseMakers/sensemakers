import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { resetDB } from '../__tests_support__/db';
import { services } from './test.services';

const TWITTER_ACCOUNT = 'sensemakergod';

describe.only('posting and processing users posts', () => {
  describe('fetch', () => {
    before(async () => {
      resetDB();

      const TEST_TOKENS_MAP = JSON.parse(
        process.env.TEST_USERS_BEARER_TOKENS as string
      );

      /** store some real twitter users in the DB */
      const users: AppUser[] = [TWITTER_ACCOUNT].map((handle): AppUser => {
        const userId = getPrefixedUserId(PLATFORM.Twitter, handle);
        return {
          userId,
          platformIds: [userId],
          twitter: [
            {
              user_id: handle,
              write: {
                accessToken: TEST_TOKENS_MAP[handle],
                expiresIn: 0,
                refreshToken: '',
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
      const user = await services.users.repo.getUserWithPlatformAccount(
        PLATFORM.Twitter,
        TWITTER_ACCOUNT,
        true
      );

      const tweet = await services.posts.publish(
        user.userId,
        {
          content: 'This is a test post',
        },
        PLATFORM.Twitter,
        TWITTER_ACCOUNT
      );

      expect(tweet).to.not.be.undefined;
    });

    it('fetch all posts from all platforms', async () => {
      /**
       * high-level trigger to process all new posts from
       * all registered users
       */
      await services.posts.process();
    });
  });
});
