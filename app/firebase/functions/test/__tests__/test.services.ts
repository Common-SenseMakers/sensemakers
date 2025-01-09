import { getFirestore } from 'firebase-admin/firestore';
import { spy, when } from 'ts-mockito';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { ActivityRepository } from '../../src/activity/activity.repository';
import { ActivityService } from '../../src/activity/activity.service';
import {
  BLUESKY_APP_PASSWORD,
  BLUESKY_SERVICE_URL,
  BLUESKY_USERNAME,
  MASTODON_ACCESS_TOKENS,
} from '../../src/config/config.runtime';
import { DBInstance } from '../../src/db/instance';
import { FeedService } from '../../src/feed/feed.service';
import { Services } from '../../src/instances/services';
import { LinksRepository } from '../../src/links/links.repository';
import { LinksMockConfig, LinksService } from '../../src/links/links.service';
import { getLinksMock } from '../../src/links/links.service.mock';
import { OntologiesRepository } from '../../src/ontologies/ontologies.repository';
import { OntologiesService } from '../../src/ontologies/ontologies.service';
import {
  ParserMockConfig,
  getParserMock,
} from '../../src/parser/mock/parser.service.mock';
import { ParserService } from '../../src/parser/parser.service';
import { BlueskyService } from '../../src/platforms/bluesky/bluesky.service';
import {
  BlueskyMockConfig,
  getBlueskyMock,
} from '../../src/platforms/bluesky/mock/bluesky.service.mock';
import { MastodonService } from '../../src/platforms/mastodon/mastodon.service';
import {
  MastodonMockConfig,
  getMastodonMock,
} from '../../src/platforms/mastodon/mock/mastodon.service.mock';
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
import { ProfilesRepository } from '../../src/profiles/profiles.repository';
import { TimeMock, getTimeMock } from '../../src/time/mock/time.service.mock';
import { TimeService } from '../../src/time/time.service';
import { UsersRepository } from '../../src/users/users.repository';
import { UsersService } from '../../src/users/users.service';
import { testCredentials } from './test.accounts';

export interface TestServicesConfig {
  twitter?: TwitterMockConfig;
  mastodon?: MastodonMockConfig;
  bluesky?: BlueskyMockConfig;
  parser: ParserMockConfig;
  links?: LinksMockConfig;
  time: 'real' | 'mock';
}

export type TestServices = Services & {
  time: TimeMock;
};

export const getTestServices = (config: TestServicesConfig) => {
  const mandatory = [
    'TWITTER_CLIENT_ID',
    'TWITTER_CLIENT_SECRET',
    'TEST_USER_ACCOUNTS',
    'OUR_TOKEN_SECRET',
    'NANOPUBS_PUBLISH_SERVERS',
    'NP_PUBLISH_RSA_PRIVATE_KEY',
    'NP_PUBLISH_RSA_PUBLIC_KEY',
    'IFRAMELY_API_KEY',
    'IFRAMELY_API_URL',
  ];

  mandatory.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(
        `${varName} undefined in process.env (derived from .env.test)`
      );
    }
  });

  const db = new DBInstance(getFirestore());
  const profilesRepo = new ProfilesRepository(db);
  const userRepo = new UsersRepository(db, profilesRepo);
  const postsRepo = new PostsRepository(db);
  const platformPostsRepo = new PlatformPostsRepository(db);
  const activityRepo = new ActivityRepository(db);
  const linksRepo = new LinksRepository(db);
  const ontologiesRepo = new OntologiesRepository(db);

  const identityServices: IdentityServicesMap = new Map();
  const platformsMap: PlatformsMap = new Map();
  const time = getTimeMock(new TimeService(), config.time);
  const ontologiesService = new OntologiesService(ontologiesRepo);

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
    bearerToken: process.env.TWITTER_BEARER_TOKEN as string,
  });

  const testUser = testCredentials[0];
  const twitter = getTwitterMock(_twitter, config.twitter, testUser);

  /** mocked mastodon */
  const _mastodon = new MastodonService(time, userRepo, {
    accessTokens: JSON.parse(MASTODON_ACCESS_TOKENS.value()),
  });
  const mastodon = getMastodonMock(_mastodon, config.mastodon, testUser);

  /** mocked mastodon */
  const _bluesky = new BlueskyService(time, userRepo, {
    BLUESKY_APP_PASSWORD: BLUESKY_APP_PASSWORD.value(),
    BLUESKY_USERNAME: BLUESKY_USERNAME.value(),
    BLUESKY_SERVICE_URL,
  });
  const bluesky = getBlueskyMock(_bluesky, config.bluesky, testUser);

  /** all identity services */
  identityServices.set(PLATFORM.Orcid, orcid);
  identityServices.set(PLATFORM.Twitter, twitter);
  identityServices.set(PLATFORM.Mastodon, mastodon);
  identityServices.set(PLATFORM.Bluesky, bluesky);

  /** all platforms */
  platformsMap.set(PLATFORM.Twitter, twitter);
  platformsMap.set(PLATFORM.Mastodon, mastodon);
  platformsMap.set(PLATFORM.Bluesky, bluesky);

  /** users service */
  const usersService = new UsersService(
    db,
    userRepo,
    profilesRepo,
    identityServices,
    platformsMap,
    time,
    {
      tokenSecret: process.env.OUR_TOKEN_SECRET as string,
      expiresIn: '30d',
    }
  );

  /** platforms service */
  const platformsService = new PlatformsService(
    platformsMap,
    time,
    usersService
  );

  /** parser service */
  const _parser = new ParserService(process.env.PARSER_API_URL as string);
  const parser = getParserMock(_parser, config.parser);

  /** links */
  const _linksService = new LinksService(linksRepo, time, {
    apiKey: process.env.IFRAMELY_API_KEY as string,
    apiUrl: process.env.IFRAMELY_API_URL as string,
  });
  const links = getLinksMock(_linksService, config.links);

  /** posts service */
  const postsProcessing = new PostsProcessing(
    usersService,
    time,
    postsRepo,
    platformPostsRepo,
    platformsService,
    links,
    db
  );

  const postsManager = new PostsManager(
    db,
    usersService,
    postsProcessing,
    platformsService,
    parser,
    time,
    ontologiesService
  );

  const activity = new ActivityService(activityRepo);

  const feed = new FeedService(db, postsManager);

  const services: TestServices = {
    users: usersService,
    postsManager,
    feed,
    platforms: platformsService,
    time: time as TimeMock,
    db,
    activity,
    links,
  };

  return services;
};
