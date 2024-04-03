import { expect } from 'chai';
import puppeteer from 'puppeteer';
import { TwitterApi } from 'twitter-api-v2';

import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { TimeService } from '../../src/time/time.service';
import {
  TwitterAccountCredentials,
  authenticateTwitterUser,
} from '../utils/authenticateTwitterUsers';
import { userRepo } from './test.services';

const TEST_ACCOUNTS = JSON.parse(
  process.env.TEST_USER_TWITTER_CREDENTIALS as string
);

describe.only('twitter integration', () => {
  let testAccount: TwitterAccountCredentials = TEST_ACCOUNTS[1];
  if (!testAccount) {
    throw new Error('testAccount undefined');
  }

  const time = new TimeService();
  const twitterService = new TwitterService(time, userRepo, {
    clientId: process.env.TWITTER_CLIENT_ID as string,
    clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
  });

  it('authenticates a twitter user with the oauth 2.0 flow', async () => {
    const browser = await puppeteer.launch({ headless: false });
    const userTokens = await authenticateTwitterUser(
      testAccount,
      twitterService,
      browser,
      'read'
    );
    expect(userTokens).to.not.be.undefined;
    // expect(userTokens.length).to.eq(1);
    if (!userTokens.read?.accessToken) {
      throw new Error('unexpected');
    }

    const twitterClient = new TwitterApi(userTokens.read?.accessToken);
    const { data: userObject } = await twitterClient.v2.me();
    expect(userObject).to.not.be.undefined;
  });
});
