import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { services } from './test.services';

describe('platforms', () => {
  describe('twitter', () => {
    it("get's all tweets in a time range using pagination", async () => {
      services;
      const twitterService = services.users.platforms.get(PLATFORM.Twitter) as
        | TwitterService
        | undefined;
      if (!twitterService) {
        throw new Error('Twitter service not found');
      }
      try {
        const tweets = await twitterService.fetch(
          {
            user_id: '1753077743816777728',
            start_time: '2024-02-22T00:00:00Z',
            end_time: '2024-02-23T00:00:00Z',
            max_results: 5,
          },
          process.env.TWITTER_MY_BEARER_TOKEN as string
        );
        expect(tweets).to.not.be.undefined;
        expect(tweets.length).to.be.equal(11);
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });
});
