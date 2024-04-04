import { expect } from 'chai';
import { TwitterApi } from 'twitter-api-v2';

import {
  TwitterAccountCredentials,
  authenticateTwitterUsers,
} from '../utils/authenticateTwitterUsers';

const TEST_ACCOUNTS: TwitterAccountCredentials[] = JSON.parse(
  process.env.TEST_USER_TWITTER_ACCOUNTS as string
);

describe.only('twitter integration', () => {
  if (!TEST_ACCOUNTS) {
    throw new Error('test acccounts undefined');
  }
  if (TEST_ACCOUNTS.length < 2) {
    throw new Error('need at least two test accounts');
  }

  it('authenticates two twitter users with the oauth 2.0 flow for reading access', async () => {
    const userTokens = await authenticateTwitterUsers(
      TEST_ACCOUNTS.slice(0, 2)
    );
    expect(userTokens).to.not.be.undefined;
    expect(userTokens.length).to.eq(2);
    for (const userToken of userTokens) {
      if (!userToken.read?.accessToken) {
        throw new Error('unexpected: access token missing');
      }
      const twitterClient = new TwitterApi(userToken.read?.accessToken);
      const { data: userObject } = await twitterClient.v2.me();
      expect(userObject).to.not.be.undefined;
    }
  });
});
