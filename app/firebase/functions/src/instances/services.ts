import { Firestore } from 'firebase-admin/firestore';

import { PLATFORM } from '../@shared/types/types.platforms';
import { ActivityRepository } from '../activity/activity.repository';
import { ActivityService } from '../activity/activity.service';
import { ClustersRepository } from '../clusters/clusters.repository';
import { ClustersService } from '../clusters/clusters.service';
import { DBInstance } from '../db/instance';
import { FeedService } from '../feed/feed.service';
import { LinksRepository } from '../links/links.repository';
import { LinksConfig, LinksService } from '../links/links.service';
import { getLinksMock } from '../links/links.service.mock';
import { OntologiesRepository } from '../ontologies/ontologies.repository';
import { OntologiesService } from '../ontologies/ontologies.service';
import { getParserMock } from '../parser/mock/parser.service.mock';
import { ParserService } from '../parser/parser.service';
import {
  BlueskyService,
  BlueskyServiceConfig,
} from '../platforms/bluesky/bluesky.service';
import { getBlueskyMock } from '../platforms/bluesky/mock/bluesky.service.mock';
import {
  MastodonService,
  MastodonServiceConfig,
} from '../platforms/mastodon/mastodon.service';
import { getMastodonMock } from '../platforms/mastodon/mock/mastodon.service.mock';
import { getTestCredentials } from '../platforms/mock/test.users';
import {
  IdentityServicesMap,
  PlatformsMap,
  PlatformsService,
} from '../platforms/platforms.service';
import { getTwitterMock } from '../platforms/twitter/mock/twitter.service.mock';
import {
  TwitterApiCredentials,
  TwitterService,
} from '../platforms/twitter/twitter.service';
import { PlatformPostsRepository } from '../posts/platform.posts.repository';
import { PostsManager } from '../posts/posts.manager';
import { PostsProcessing } from '../posts/posts.processing';
import { PostsRepository } from '../posts/posts.repository';
import { ProfilesRepository } from '../profiles/profiles.repository';
import { ProfilesService } from '../profiles/profiles.service';
import { TasksRepository } from '../tasks/tasks.repository';
import { TasksService } from '../tasks/tasks.service';
import { TimeService } from '../time/time.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { logger } from './logger';

const DEBUG = false;

export interface ClerkConfig {
  publishableKey: string;
  secretKey: string;
}

export interface Services {
  users: UsersService;
  profiles: ProfilesService;
  postsManager: PostsManager;
  feed: FeedService;
  platforms: PlatformsService;
  time: TimeService;
  db: DBInstance;
  activity: ActivityService;
  links: LinksService;
  ontology: OntologiesService;
  clusters: ClustersService;
  tasks: TasksService;
}

export interface ServicesConfig {
  testCredentials: string;
  twitter: TwitterApiCredentials;
  mastodon: MastodonServiceConfig;
  bluesky: BlueskyServiceConfig;
  parser: string;
  isEmulator: boolean;
  links: LinksConfig;
  clerk: ClerkConfig;
  mock: {
    USE_REAL_PARSER: boolean;
    USE_REAL_TWITTER: boolean;
    USE_REAL_MASTODON: boolean;
    USE_REAL_BLUESKY: boolean;
    USE_REAL_NANOPUB: boolean;
    USE_REAL_EMAIL: boolean;
    USE_REAL_LINKS: boolean;
  };
}

export const createServices = (
  firestore: Firestore,
  config: ServicesConfig
) => {
  if (DEBUG) logger.info('Creating services');

  const db = new DBInstance(firestore);
  const profilesRepo = new ProfilesRepository(db);
  const userRepo = new UsersRepository(db, profilesRepo);
  const postsRepo = new PostsRepository(db);
  const platformPostsRepo = new PlatformPostsRepository(db);
  const activityRepo = new ActivityRepository(db);
  const linksRepo = new LinksRepository(db);
  const ontologiesRepo = new OntologiesRepository(db);
  const clustersRepo = new ClustersRepository(db);

  const identityPlatforms: IdentityServicesMap = new Map();
  const platformsMap: PlatformsMap = new Map();
  const time = new TimeService();
  const ontologiesService = new OntologiesService(ontologiesRepo);
  const clusters = new ClustersService(clustersRepo);

  const _twitter = new TwitterService(time, userRepo, config.twitter);

  const testCredentials = getTestCredentials(config.testCredentials);
  const testUser = testCredentials && testCredentials[0];

  const twitter = getTwitterMock(
    _twitter,
    config.mock.USE_REAL_TWITTER
      ? undefined
      : { signup: true, fetch: true, publish: true, get: true },
    testUser
  );

  const _mastodon = new MastodonService(time, userRepo, config.mastodon);
  const mastodon = getMastodonMock(
    _mastodon,
    config.mock.USE_REAL_MASTODON
      ? undefined
      : { signup: true, fetch: true, publish: true, get: true },
    testUser
  );
  const _bluesky = new BlueskyService(db, time, config.bluesky);
  const bluesky = getBlueskyMock(
    _bluesky,
    config.mock.USE_REAL_BLUESKY
      ? undefined
      : { signup: true, fetch: true, publish: true, get: true },
    testUser
  );

  /** all identity services */
  identityPlatforms.set(PLATFORM.Twitter, twitter);
  identityPlatforms.set(PLATFORM.Mastodon, mastodon);
  identityPlatforms.set(PLATFORM.Bluesky, bluesky);

  /** all platforms */
  platformsMap.set(PLATFORM.Twitter, twitter);
  platformsMap.set(PLATFORM.Mastodon, mastodon);
  platformsMap.set(PLATFORM.Bluesky, bluesky);

  /** profiles service */
  const profilesService = new ProfilesService(
    profilesRepo,
    identityPlatforms,
    db
  );

  /** users service */
  const usersService = new UsersService(
    db,
    userRepo,
    profilesService,
    identityPlatforms,
    platformsMap,
    time
  );

  // trigger magic init

  /** platforms service */
  const platformsService = new PlatformsService(
    platformsMap,
    time,
    usersService
  );

  /** parser service */
  const _parser = new ParserService(config.parser);
  const parser = getParserMock(
    _parser,
    config.mock.USE_REAL_PARSER ? 'real' : 'mock'
  );

  const _linksService = new LinksService(
    clusters,
    linksRepo,
    time,
    ontologiesService,
    config.links
  );
  const linksService = getLinksMock(
    _linksService,
    config.mock.USE_REAL_LINKS ? undefined : { get: true, enable: true }
  );

  /** posts service */
  const postsProcessing = new PostsProcessing(
    usersService,
    time,
    postsRepo,
    platformPostsRepo,
    platformsService,
    linksService,
    clusters
  );
  // const postsParser = new PostsParser(platformsService, parserService);
  const postsManager = new PostsManager(
    db,
    usersService,
    profilesService,
    postsProcessing,
    platformsService,
    parser,
    time,
    ontologiesService,
    clusters
  );

  /** activity service */
  const activity = new ActivityService(activityRepo);

  /** feed */
  const feed = new FeedService(db, postsManager, clusters);

  /** tasks */

  const taskRepo = new TasksRepository(db);
  const tasks = new TasksService(taskRepo);

  /** all services */
  const services: Services = {
    users: usersService,
    postsManager: postsManager,
    platforms: platformsService,
    feed,
    time,
    db,
    activity,
    links: linksService,
    ontology: ontologiesService,
    profiles: profilesService,
    clusters,
    tasks,
  };

  if (DEBUG) {
    logger.debug('services', {
      USE_REAL_PARSER: config.mock.USE_REAL_PARSER,
      USE_REAL_TWITTER: config.mock.USE_REAL_TWITTER,
      USE_REAL_MASTODON: config.mock.USE_REAL_MASTODON,
      USE_REAL_BLUESKY: config.mock.USE_REAL_BLUESKY,
      USE_REAL_NANOPUB: config.mock.USE_REAL_NANOPUB,
      USE_REAL_EMAIL: config.mock.USE_REAL_EMAIL,
    });
  }
  return services;
};
