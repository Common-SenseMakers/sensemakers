import { expect } from 'chai';
import { TwitterApi } from 'twitter-api-v2';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
import { authenticateTestUsers } from '../utils/authenticate.users';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

const NUM_TWITTER_USERS = 1;

/** skip for now as it will invalidate access tokens */
describe.skip('twitter integration', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? undefined : { publish: true, signup: true },
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
  });

  it(`authenticates ${NUM_TWITTER_USERS} twitter users with the oauth 2.0 flow for reading access`, async () => {
    const appUsers = await services.db.run((manager) =>
      authenticateTestUsers(
        testCredentials.slice(0, NUM_TWITTER_USERS),
        services,
        manager
      )
    );

    expect(appUsers).to.not.be.undefined;
    expect(appUsers.length).to.eq(NUM_TWITTER_USERS);
    for (const appUser of appUsers) {
      for (const twitterDetails of appUser.accounts[PLATFORM.Twitter] ?? []) {
        if (!twitterDetails.credentials.read?.accessToken) {
          throw new Error('unexpected: access token missing');
        }
        const twitterClient = new TwitterApi(
          twitterDetails.credentials.read?.accessToken
        );
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
