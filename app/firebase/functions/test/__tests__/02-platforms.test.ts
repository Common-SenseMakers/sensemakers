import { expect } from 'chai';
import { TwitterApi } from 'twitter-api-v2';

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
            userDetails: {
              user_id: TEST_TOKENS_MAP[TWITTER_ACCOUNT].user_id,
              signupDate: 0,
              read: {
                accessToken: TEST_TOKENS_MAP[TWITTER_ACCOUNT].accessToken,
              },
            },
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
    it('instantiates two user-wide API clients and can make authenticated requests', async () => {
      const appOnlyTwitterClient = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID as string,
        clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      });
      const testUserData = require('./test_user_data.json');
      let testUserDataWithUpdatedTokens: any[] = [];
      try {
        for (const user of testUserData) {
          const { client: refreshedClient, refreshToken } =
            await appOnlyTwitterClient.refreshOAuth2Token(user.refresh_token);
          const me = await refreshedClient.v2.me();
          const updatedUser = {
            ...user,
            refresh_token: refreshToken,
          };
          testUserDataWithUpdatedTokens.push(updatedUser);
          expect(me.data).to.not.be.undefined;
        }
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
      const fs = require('fs');
      fs.writeFileSync(
        './test/__tests__/test_user_data.json',
        JSON.stringify(testUserDataWithUpdatedTokens)
      );
    });
  });
});
