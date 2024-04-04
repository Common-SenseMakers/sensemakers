import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types';
import { logger } from '../../src/instances/logger';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { resetDB } from '../__tests_support__/db';
import { createTestAppUsers } from '../utils/createTestAppUsers';
import { MockedTime, services, userRepo } from './test.services';

describe('platforms', () => {
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
      if (!usersDetails || usersDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const twitterService = services.platforms.get(PLATFORM.Twitter);
      const userDetails = usersDetails[0];
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
    it('refreshes the access token if it has expired when using the twitter service', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      const usersDetails = appUser[PLATFORM.Twitter];
      if (!usersDetails || usersDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const userDetails = usersDetails[0];
      const twitterService = new TwitterService(MockedTime, userRepo, {
        clientId: process.env.TWITTER_CLIENT_ID as string,
        clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      });

      const tweets = twitterService.fetch([
        {
          userDetails,
          start_time: Date.now() - 1000,
        },
      ]);
      expect(tweets).to.not.be.undefined;
      const user = await services.users.repo.getUserWithPlatformAccount(
        PLATFORM.Twitter,
        userDetails.user_id,
        true
      );
      const newUserDetails = user[PLATFORM.Twitter];
      if (!newUserDetails || newUserDetails.length != 1) {
        throw new Error('Unexpected');
      }
      expect(newUserDetails[0]).to.not.deep.equal(userDetails);
    });
  });
});
