import { anything, instance, spy, when } from 'ts-mockito';

import {
  OrcidSignupData,
  OrcidUserDetails,
  PLATFORM,
  TwitterSignupData,
  TwitterUserDetails,
} from '../../src/@shared/types';
import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
} from '../../src/config/config';
import { DBInstance } from '../../src/db/instance';
import { OrcidService } from '../../src/platforms/orcid/orcid.service';
import { IdentityPlatforms } from '../../src/platforms/platforms.interface';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersRepository } from '../../src/users/users.repository';
import { UsersService } from '../../src/users/users.service';

export const TEST_USER_NAME = 'Test User';
export const TEST_TWITTER_NAME = 'testuser';

const db = new DBInstance();
const userRepo = new UsersRepository(db);
const identityServices: IdentityPlatforms = new Map();

/** mocked orcid */
const orcid = new OrcidService();
const MockedOrcid = spy(orcid);
when(MockedOrcid.handleSignupData(anything())).thenCall(
  (data: OrcidSignupData): OrcidUserDetails => {
    return { user_id: data.code, name: TEST_USER_NAME };
  }
);
const mockedOrcid = instance(MockedOrcid);

/** mocked twitter */
const twitter = new TwitterService({
  key: TWITTER_API_KEY,
  secret: TWITTER_API_SECRET_KEY,
});
const MockedTwitter = spy(twitter);
when(MockedTwitter.handleSignupData(anything())).thenCall(
  (data: TwitterSignupData): TwitterUserDetails => {
    return {
      user_id: data.oauth_verifier,
      accessSecret: 'dummy',
      accessToken: 'dummy',
      oauth_verifier: 'dummy',
      screen_name: TEST_TWITTER_NAME,
    };
  }
);
const mockedTWitter = instance(MockedTwitter);

/** all identity services */
identityServices.set(PLATFORM.Orcid, mockedOrcid);
identityServices.set(PLATFORM.Twitter, mockedTWitter);

/** users service */
const usersService = new UsersService(userRepo, identityServices);

export const services = {
  users: usersService,
};
