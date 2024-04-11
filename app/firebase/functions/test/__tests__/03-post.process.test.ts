import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../__tests_support__/db';
import { createTestAppUsers } from '../utils/user.factory';
import { services } from './test.services';

describe.only('process', () => {
  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    let appUser: AppUser | undefined;

    before(async () => {
      const users = await createTestAppUsers();
      appUser = users[0];
    });

    /** skip for now because we have not yet granted write access */
    it('publish a post in the name of the test user', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      const user_id = appUser[PLATFORM.Twitter]?.[0].user_id;
      if (!user_id) {
        throw new Error('Unexpected');
      }

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

      const tweet = await services.platforms.get(PLATFORM.Twitter).publish({
        platformPost: {
          id: '',
          draft: { text: `This is a test post ${Date.now()}` },
        },
        userDetails: account,
      });

      /** set lastFetched to one second before the last tweet timestamp */
      await services.users.repo.setLastFetched(
        PLATFORM.Twitter,
        user_id,
        tweet.post.timestampMs - 1000
      );

      expect(tweet).to.not.be.undefined;

      await new Promise<void>((resolve) => setTimeout(resolve, 10000));
    });

    it('fetch all posts from all platforms', async () => {
      /**
       * high-level trigger to process all new posts from
       * all registered users
       */
      // await services.posts.process();
      console.log('done');
    });
  });
});
