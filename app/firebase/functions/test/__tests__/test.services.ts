import { spy, when } from 'ts-mockito';

import { PLATFORM } from '../../src/@shared/types/types';
import { DBInstance } from '../../src/db/instance';
import { Services } from '../../src/instances/services';
import {
  ParserMockConfig,
  getParserMock,
} from '../../src/parser/mock/parser.service.mock';
import { ParserService } from '../../src/parser/parser.service';
import {
  NanopubMockConfig,
  getNanopubMock,
} from '../../src/platforms/nanopub/mock/nanopub.service.mock';
import { NanopubService } from '../../src/platforms/nanopub/nanopub.service';
import { OrcidService } from '../../src/platforms/orcid/orcid.service';
import {
  IdentityServicesMap,
  PlatformsMap,
  PlatformsService,
} from '../../src/platforms/platforms.service';
import {
  TwitterMockConfig,
  getTwitterMock,
} from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { PlatformPostsRepository } from '../../src/posts/platform.posts.repository';
import { PostsManager } from '../../src/posts/posts.manager';
import { PostsProcessing } from '../../src/posts/posts.processing';
import { PostsRepository } from '../../src/posts/posts.repository';
import { TimeService } from '../../src/time/time.service';
import { UsersRepository } from '../../src/users/users.repository';
import { UsersService } from '../../src/users/users.service';

export interface TestServicesConfig {
  twitter: TwitterMockConfig;
  nanopub: NanopubMockConfig;
  parser: ParserMockConfig;
}

export const getTestServices = (config: TestServicesConfig) => {
  const mandatory = [
    'TWITTER_CLIENT_ID',
    'TWITTER_CLIENT_SECRET',
    'TEST_USER_ACCOUNTS',
    'OUR_TOKEN_SECRET',
    'NANOPUBS_PUBLISH_SERVERS',
  ];

  mandatory.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(
        `${varName} undefined in process.env (derived from .env.test)`
      );
    }
  });

  const db = new DBInstance();
  const userRepo = new UsersRepository(db);
  const postsRepo = new PostsRepository(db);
  const platformPostsRepo = new PlatformPostsRepository(db);

  const identityServices: IdentityServicesMap = new Map();
  const platformsMap: PlatformsMap = new Map();
  const time = new TimeService();
  const MockedTime = spy(new TimeService());

  when(MockedTime.now()).thenReturn(
    /** 3 hours from now so the token will always be invalid */
    Date.now() + 3 * 60 * 60 * 1000
  );

  /** mocked orcid */
  const orcid = new OrcidService();

  /** mocked twitter */
  const _twitter = new TwitterService(time, userRepo, {
    clientId: process.env.TWITTER_CLIENT_ID as string,
    clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
  });

  const twitter = getTwitterMock(_twitter, config.twitter);

  /** nanopub */
  const _nanopub = new NanopubService(time);
  const nanopub = getNanopubMock(_nanopub, config.nanopub);

  /** all identity services */
  identityServices.set(PLATFORM.Orcid, orcid);
  identityServices.set(PLATFORM.Twitter, twitter);
  identityServices.set(PLATFORM.Nanopub, nanopub);

  /** users service */
  const usersService = new UsersService(userRepo, identityServices, {
    tokenSecret: process.env.OUR_TOKEN_SECRET as string,
    expiresIn: '30d',
  });

  /** all platforms */
  platformsMap.set(PLATFORM.Twitter, twitter);
  platformsMap.set(PLATFORM.Nanopub, nanopub);

  /** platforms service */
  const platformsService = new PlatformsService(
    platformsMap,
    time,
    usersService
  );

  /** parser service */
  const _parser = new ParserService(process.env.PARSER_API_URL as string);
  const parser = getParserMock(_parser, config.parser);

  /** posts service */
  const postsProcessing = new PostsProcessing(
    usersService,
    time,
    postsRepo,
    platformPostsRepo,
    platformsService
  );

  const postsManager = new PostsManager(
    db,
    usersService,
    postsProcessing,
    platformsService,
    parser
  );

  const services: Services = {
    users: usersService,
    postsManager: postsManager,
    platforms: platformsService,
    time: time,
    db,
  };

  return services;
};
