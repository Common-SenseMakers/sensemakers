import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { services } from './test.services';

describe('platforms', () => {
  describe('twitter', () => {
    it('get latest tweets', async () => {
      const twitterService = services.users.platforms.get(PLATFORM.Twitter) as
        | TwitterService
        | undefined;
      if (!twitterService) {
        throw new Error('Twitter service not found');
      }
      const tweets = await twitterService.fetch();
      expect(tweets).to.not.be.undefined;
      expect(tweets.length).to.be.equal(0);
    });
  });
});
