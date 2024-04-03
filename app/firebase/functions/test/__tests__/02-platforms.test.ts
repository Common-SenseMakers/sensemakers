import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../__tests_support__/db';
import { createTestAppUsers } from '../utils/createTestAppUsers';
import { services } from './test.services';

describe.only('platforms', () => {
  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('twitter', () => {
    let appUser: AppUser | undefined;
    before(async () => {
      const users = await createTestAppUsers();
      appUser = users[0];
    });
    it("get's all tweets in a time range using pagination", async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      const usersDetails = appUser[PLATFORM.Twitter];
      if (!usersDetails) {
        throw new Error('Unexpected');
      }
      const twitterService = services.platforms.get(PLATFORM.Twitter);
      let userDetails = usersDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }
      try {
        const tweets = await twitterService.fetch([
          {
            userDetails,
            start_time: 1708560000000,
            end_time: 1708646400000,
          },
        ]);
        expect(tweets).to.not.be.undefined;
        expect(tweets.length).to.be.equal(11);
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });
});
