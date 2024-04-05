import { expect } from 'chai';
import { TwitterApi } from 'twitter-api-v2';

import {
  TwitterAccountCredentials,
  authenticateTwitterUsers,
} from '../utils/authenticateTwitterUsers';

const NUW_TWITTER_USERS = 1;
const TEST_ACCOUNTS: TwitterAccountCredentials[] = JSON.parse(
  process.env.TEST_USER_TWITTER_ACCOUNTS as string
);

describe('twitter integration', () => {
  if (!TEST_ACCOUNTS) {
    throw new Error('test acccounts undefined');
  }
  if (TEST_ACCOUNTS.length < NUW_TWITTER_USERS) {
    throw new Error('need at least two test accounts');
  }

  it(`authenticates ${NUW_TWITTER_USERS} twitter users with the oauth 2.0 flow for reading access`, async () => {
    const userTokens = await authenticateTwitterUsers(
      TEST_ACCOUNTS.slice(0, NUW_TWITTER_USERS)
    );
    expect(userTokens).to.not.be.undefined;
    expect(userTokens.length).to.eq(NUW_TWITTER_USERS);
    for (const userToken of userTokens) {
      if (!userToken.read?.accessToken) {
        throw new Error('unexpected: access token missing');
      }
      const twitterClient = new TwitterApi(userToken.read?.accessToken);
      const { data: userObject } = await twitterClient.v2.me();
      expect(userObject).to.not.be.undefined;
      const result = await twitterClient.v2.userTimeline(userToken.user_id, {
        start_time: new Date(Date.now()).toISOString(),
      });
      expect(result).to.not.be.undefined;
    }
  });
});
