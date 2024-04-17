import { expect } from 'chai';
import { TwitterApi } from 'twitter-api-v2';

import { PLATFORM } from '../../src/@shared/types/types';
import {
  TestUserCredentials,
  authenticateTestUsers,
} from '../utils/authenticate.users';
import { getTestServices } from './test.services';

const NUM_TWITTER_USERS = 1;
const TEST_ACCOUNTS: TestUserCredentials[] = JSON.parse(
  process.env.TEST_USER_ACCOUNTS as string
);

/** skip for now as it will invalidate access tokens */
describe.skip('twitter integration', () => {
  const services = getTestServices();

  if (!TEST_ACCOUNTS) {
    throw new Error('test acccounts undefined');
  }
  if (TEST_ACCOUNTS.length < NUM_TWITTER_USERS) {
    throw new Error('need at least two test accounts');
  }

  it(`authenticates ${NUM_TWITTER_USERS} twitter users with the oauth 2.0 flow for reading access`, async () => {
    const appUsers = await services.db.run((manager) =>
      authenticateTestUsers(
        TEST_ACCOUNTS.slice(0, NUM_TWITTER_USERS),
        services,
        manager
      )
    );

    expect(appUsers).to.not.be.undefined;
    expect(appUsers.length).to.eq(NUM_TWITTER_USERS);
    for (const appUser of appUsers) {
      for (const twitterDetails of appUser[PLATFORM.Twitter] ?? []) {
        if (!twitterDetails.read?.accessToken) {
          throw new Error('unexpected: access token missing');
        }
        const twitterClient = new TwitterApi(twitterDetails.read?.accessToken);
        const { data: userObject } = await twitterClient.v2.me();
        expect(userObject).to.not.be.undefined;
        const result = await twitterClient.v2.userTimeline(
          twitterDetails.user_id,
          {
            start_time: new Date(Date.now()).toISOString(),
          }
        );
        expect(result).to.not.be.undefined;
      }
    }
  });
});
