import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types';
import { services } from './test.services';

describe.only('platforms', () => {
  describe('twitter', () => {
    it("get's all tweets in a time range using pagination", async () => {
      services;
      const twitterService = services.platforms.get(PLATFORM.Twitter);

      try {
        const tweets = await twitterService.fetchPostsSince([
          {
            user_id: '1753077743816777728',
            start_time: 1708560000000,
            credentials: {
              accessToken: process.env.TWITTER_MY_BEARER_TOKEN,
            },
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
