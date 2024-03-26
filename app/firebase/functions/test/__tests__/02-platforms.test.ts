import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../__tests_support__/db';
import { services } from './test.services';

const TWITTER_ACCOUNT = 'sensemakergod';

const TEST_TOKENS_MAP = JSON.parse(
  process.env.TEST_USERS_BEARER_TOKENS as string
);

describe('platforms', () => {
  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('twitter', () => {
    it("get's all tweets in a time range using pagination", async () => {
      services;
      const twitterService = services.platforms.get(PLATFORM.Twitter);

      try {
        const tweets = await twitterService.fetch([
          {
            user_id: '1753077743816777728',
            start_time: 1708560000000,
            credentials: {
              accessToken: TEST_TOKENS_MAP[TWITTER_ACCOUNT].accessToken,
            },
          },
        ]);
        expect(tweets).to.not.be.undefined;
        expect(tweets.length).to.be.equal(0);
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });
});
