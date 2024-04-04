import { anything, instance, spy, when } from 'ts-mockito';

import { PLATFORM } from '../../src/@shared/types';
import { ParsePostResult } from '../../src/@shared/types.parser';
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
import { TimeService } from '../../src/time/time.service';
import { UsersRepository } from '../../src/users/users.repository';
import { UsersService } from '../../src/users/users.service';

const mandatory = ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const db = new DBInstance();
export const userRepo = new UsersRepository(db);
const postsRepo = new PostsRepository(db);

const identityServices: IdentityServicesMap = new Map();
const platformsMap: PlatformsMap = new Map();
const time = new TimeService();
export const MockedTime = spy(time);
when(MockedTime.now()).thenReturn(
  /** 3 hours from now so the token will always be invalid */
  Date.now() + 3 * 60 * 60 * 1000
);

/** mocked orcid */
const orcid = new OrcidService();

/** mocked twitter */
const twitter = new TwitterService(time, userRepo, {
  clientId: process.env.TWITTER_CLIENT_ID as string,
  clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
});

/** all identity services */
identityServices.set(PLATFORM.Orcid, orcid);
identityServices.set(PLATFORM.Twitter, twitter);

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
