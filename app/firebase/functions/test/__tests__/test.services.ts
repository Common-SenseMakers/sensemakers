import { anything, instance, spy, when } from 'ts-mockito';

import { PLATFORM } from '../../src/@shared/types';
import {
  OrcidSignupData,
  OrcidUserDetails,
} from '../../src/@shared/types.orcid';
import { ParsePostResult } from '../../src/@shared/types.parser';
import {
  TwitterSignupData,
  TwitterUserDetails,
} from '../../src/@shared/types.twitter';
import { DBInstance } from '../../src/db/instance';
import { Services } from '../../src/instances/services';
import { ParserService } from '../../src/parser/parser.service';
import { OrcidService } from '../../src/platforms/orcid/orcid.service';
import {
  IdentityServicesMap,
  PlatformsMap,
  PlatformsService,
} from '../../src/platforms/platforms.service';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { PostsRepository } from '../../src/posts/posts.repository';
import { PostsService } from '../../src/posts/posts.service';
import { UsersRepository } from '../../src/users/users.repository';
import { UsersService } from '../../src/users/users.service';

const mandatory = [
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET',
  'OUR_TOKEN_SECRET',
  'ACCESS_TOKEN_TEST_USER_0',
  'TWITTER_MY_BEARER_TOKEN',
  'PARSER_API_URL',
];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

export const TEST_ORCID_PROFILE = { name: 'Orcid Scientist' };

export const TEST_TWITTER_PROFILE = {
  id: '1',
  name: 'TestName',
  username: 'testhandle',
};

const db = new DBInstance();
const userRepo = new UsersRepository(db);
const postsRepo = new PostsRepository(db);

const identityServices: IdentityServicesMap = new Map();
const platformsMap: PlatformsMap = new Map();

/** mocked orcid */
const orcid = new OrcidService();
const MockedOrcid = spy(orcid);
when(MockedOrcid.handleSignupData(anything())).thenCall(
  (data: OrcidSignupData): OrcidUserDetails => {
    return { user_id: data.code, profile: TEST_ORCID_PROFILE };
  }
);
const mockedOrcid = instance(MockedOrcid);

/** mocked twitter */
const twitter = new TwitterService({
  clientId: process.env.TWITTER_CLIENT_ID as string,
  clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
});
const MockedTwitter = spy(twitter);

when(MockedTwitter.handleSignupData(anything())).thenCall(
  (data: TwitterSignupData): TwitterUserDetails => {
    return {
      user_id: data.code,
      write: {
        accessToken: process.env.ACCESS_TOKEN_TEST_USER_0 as string,
        refreshToken: '',
        expiresIn: 0,
      },
      profile: TEST_TWITTER_PROFILE,
    };
  }
);
const mockedTWitter = instance(MockedTwitter);

/** all identity services */
identityServices.set(PLATFORM.Orcid, mockedOrcid);
identityServices.set(PLATFORM.Twitter, mockedTWitter);

/** users service */
const usersService = new UsersService(userRepo, identityServices, {
  tokenSecret: process.env.OUR_TOKEN_SECRET as string,
  expiresIn: '30d',
});

/** all platforms */
platformsMap.set(PLATFORM.Twitter, twitter);

/** platforms service */
const platformsService = new PlatformsService(platformsMap);

/** parser service */
const parserService = new ParserService(process.env.PARSER_API_URL as string);

ParserService;
const MockedParser = spy(parserService);

const mockedResult: ParsePostResult[] = [
  {
    post: 'test',
    semantics: '<semantics>',
  },
];
when(MockedParser.parsePosts(anything())).thenResolve(mockedResult);
const mockedParser = instance(MockedParser);

/** posts service */
const postsService = new PostsService(
  usersService,
  platformsService,
  postsRepo,
  mockedParser
);

export const services: Services = {
  users: usersService,
  posts: postsService,
  platforms: platformsService,
};
