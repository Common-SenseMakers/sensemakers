import { Firestore } from 'firebase-admin/firestore';

import { OurTokenConfig } from '../@shared/types/types.fetch';
import { PLATFORM } from '../@shared/types/types.platforms';
import { ActivityRepository } from '../activity/activity.repository';
import { ActivityService } from '../activity/activity.service';
import { DBInstance } from '../db/instance';
import {
  EmailSenderService,
  EmailServiceConfig,
} from '../emailSender/email.sender.service';
import { getEmailSenderMock } from '../emailSender/email.sender.service.mock';
import { FeedService } from '../feed/feed.service';
import { NotificationService } from '../notifications/notification.service';
import { NotificationsRepository } from '../notifications/notifications.repository';
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
import { getNanopubMock } from '../platforms/nanopub/mock/nanopub.service.mock';
import {
  NanopubService,
  NanopubServiceConfig,
} from '../platforms/nanopub/nanopub.service';
// import { ParserService } from '../parser/parser.service';
import { OrcidService } from '../platforms/orcid/orcid.service';
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
import { TriplesRepository } from '../semantics/triples.repository';
import { TimeService } from '../time/time.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { logger } from './logger';

const DEBUG = false;

export interface Services {
  users: UsersService;
  postsManager: PostsManager;
  feed: FeedService;
  platforms: PlatformsService;
  time: TimeService;
  db: DBInstance;
  notifications: NotificationService;
  activity: ActivityService;
  email: EmailSenderService;
}

export interface ServicesConfig {
  testCredentials: string;
  twitter: TwitterApiCredentials;
  nanopub: NanopubServiceConfig;
  mastodon: MastodonServiceConfig;
  bluesky: BlueskyServiceConfig;
  email: EmailServiceConfig;
  parser: string;
  our: OurTokenConfig;
  isEmulator: boolean;
  mock: {
    USE_REAL_PARSER: boolean;
    USE_REAL_TWITTER: boolean;
    USE_REAL_MASTODON: boolean;
    USE_REAL_BLUESKY: boolean;
    USE_REAL_NANOPUB: boolean;
    USE_REAL_EMAIL: boolean;
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
  const triplesRepo = new TriplesRepository(db);
  const platformPostsRepo = new PlatformPostsRepository(db);
  const activityRepo = new ActivityRepository(db);
  const notificationsRepo = new NotificationsRepository(db);

  const identityPlatforms: IdentityServicesMap = new Map();
  const platformsMap: PlatformsMap = new Map();
  const time = new TimeService();

  const orcid = new OrcidService();
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

  const _nanopub = new NanopubService(time, config.nanopub);
  const nanopub = getNanopubMock(
    _nanopub,
    config.mock.USE_REAL_NANOPUB ? 'real' : 'mock-publish'
  );

  const _mastodon = new MastodonService(time, userRepo, config.mastodon);
  const mastodon = getMastodonMock(
    _mastodon,
    config.mock.USE_REAL_MASTODON
      ? undefined
      : { signup: true, fetch: true, publish: true, get: true },
    testUser
  );
  const _bluesky = new BlueskyService(time, userRepo, config.bluesky);
  const bluesky = getBlueskyMock(
    _bluesky,
    config.mock.USE_REAL_BLUESKY
      ? undefined
      : { signup: true, fetch: true, publish: true, get: true },
    testUser
  );

  /** all identity services */
  identityPlatforms.set(PLATFORM.Orcid, orcid);
  identityPlatforms.set(PLATFORM.Twitter, twitter);
  identityPlatforms.set(PLATFORM.Nanopub, nanopub);
  identityPlatforms.set(PLATFORM.Mastodon, mastodon);
  identityPlatforms.set(PLATFORM.Bluesky, bluesky);

  /** all platforms */
  platformsMap.set(PLATFORM.Twitter, twitter);
  platformsMap.set(PLATFORM.Nanopub, nanopub);
  platformsMap.set(PLATFORM.Mastodon, mastodon);
  platformsMap.set(PLATFORM.Bluesky, bluesky);

  /** email sender service */
  const _email = new EmailSenderService(config.email);

  const { instance: email } = getEmailSenderMock(
    _email,
    config.mock.USE_REAL_EMAIL ? 'real' : 'mock'
  );

  /** users service */
  const usersService = new UsersService(
    db,
    userRepo,
    profilesRepo,
    identityPlatforms,
    platformsMap,
    time,
    email,
    config.our
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

  /** posts service */
  const postsProcessing = new PostsProcessing(
    usersService,
    time,
    triplesRepo,
    postsRepo,
    platformPostsRepo,
    platformsService
  );
  // const postsParser = new PostsParser(platformsService, parserService);
  const postsManager = new PostsManager(
    db,
    usersService,
    postsProcessing,
    platformsService,
    parser,
    time
  );

  /** activity service */
  const activity = new ActivityService(activityRepo);

  /** notification service */

  const notifications = new NotificationService(
    db,
    notificationsRepo,
    postsRepo,
    platformPostsRepo,
    activityRepo,
    userRepo,
    email,
    !config.isEmulator
  );

  /** feed */
  const feed = new FeedService(db, postsManager);

  /** all services */
  const services: Services = {
    users: usersService,
    postsManager: postsManager,
    platforms: platformsService,
    feed,
    time,
    db,
    notifications,
    activity,
    email,
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
