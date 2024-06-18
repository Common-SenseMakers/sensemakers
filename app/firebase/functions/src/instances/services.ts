import { PLATFORM } from '../@shared/types/types.user';
import { ActivityRepository } from '../activity/activity.repository';
import {
  FUNCTIONS_PY_URL,
  NANOPUBS_PUBLISH_SERVERS,
  NP_PUBLISH_RSA_PRIVATE_KEY,
  NP_PUBLISH_RSA_PUBLIC_KEY,
  OUR_EXPIRES_IN,
  OUR_TOKEN_SECRET,
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  USE_REAL_NANOPUB,
  USE_REAL_NOTIFICATIONS,
  USE_REAL_PARSER,
  USE_REAL_TWITTERX,
} from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { NotificationService } from '../notifications/notification.service';
import { getNotificationsMock } from '../notifications/notification.service.mock';
import { getParserMock } from '../parser/mock/parser.service.mock';
import { ParserService } from '../parser/parser.service';
import { getNanopubMock } from '../platforms/nanopub/mock/nanopub.service.mock';
import { NanopubService } from '../platforms/nanopub/nanopub.service';
// import { ParserService } from '../parser/parser.service';
import { OrcidService } from '../platforms/orcid/orcid.service';
import {
  IdentityServicesMap,
  PlatformsMap,
  PlatformsService,
} from '../platforms/platforms.service';
import { getTwitterMock } from '../platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../platforms/twitter/twitter.service';
import { PlatformPostsRepository } from '../posts/platform.posts.repository';
import { PostsManager } from '../posts/posts.manager';
import { PostsProcessing } from '../posts/posts.processing';
import { PostsRepository } from '../posts/posts.repository';
import { TriplesRepository } from '../semantics/triples.repository';
import { TimeService } from '../time/time.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

export interface Services {
  users: UsersService;
  postsManager: PostsManager;
  platforms: PlatformsService;
  time: TimeService;
  db: DBInstance;
  notifications: NotificationService;
}

export const createServices = () => {
  const db = new DBInstance();
  const userRepo = new UsersRepository(db);
  const postsRepo = new PostsRepository(db);
  const triplesRepo = new TriplesRepository(db);
  const platformPostsRepo = new PlatformPostsRepository(db);
  const activityRepo = new ActivityRepository(db);

  const identityPlatforms: IdentityServicesMap = new Map();
  const platformsMap: PlatformsMap = new Map();
  const time = new TimeService();

  const orcid = new OrcidService();
  const _twitter = new TwitterService(time, userRepo, {
    clientId: TWITTER_CLIENT_ID.value(),
    clientSecret: TWITTER_CLIENT_SECRET.value(),
  });

  const twitter = getTwitterMock(
    _twitter,
    USE_REAL_TWITTERX.value() ? 'real' : 'mock-publish'
  );

  const _nanopub = new NanopubService(time, {
    servers: JSON.parse(NANOPUBS_PUBLISH_SERVERS.value()),
    rsaKeys: {
      privateKey: NP_PUBLISH_RSA_PRIVATE_KEY.value(),
      publicKey: NP_PUBLISH_RSA_PUBLIC_KEY.value(),
    },
  });
  const nanopub = getNanopubMock(
    _nanopub,
    USE_REAL_NANOPUB.value() ? 'real' : 'mock-publish'
  );

  /** all identity services */
  identityPlatforms.set(PLATFORM.Orcid, orcid);
  identityPlatforms.set(PLATFORM.Twitter, twitter);
  identityPlatforms.set(PLATFORM.Nanopub, nanopub);

  /** all platforms */
  platformsMap.set(PLATFORM.Twitter, twitter);
  platformsMap.set(PLATFORM.Nanopub, nanopub);

  /** users service */
  const usersService = new UsersService(db, userRepo, identityPlatforms, {
    tokenSecret: OUR_TOKEN_SECRET.value(),
    expiresIn: OUR_EXPIRES_IN,
  });

  /** platforms service */
  const platformsService = new PlatformsService(
    platformsMap,
    time,
    usersService
  );

  /** parser service */
  const _parser = new ParserService(FUNCTIONS_PY_URL.value());
  const parser = getParserMock(
    _parser,
    USE_REAL_PARSER.value() ? 'real' : 'mock'
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
    parser
  );

  /** notification service */
  const _notifications = new NotificationService(db, activityRepo);
  const notifications = getNotificationsMock(
    _notifications,
    USE_REAL_NOTIFICATIONS.value() ? 'real' : 'mock'
  );

  /** all services */
  const services: Services = {
    users: usersService,
    postsManager: postsManager,
    platforms: platformsService,
    time,
    db,
    notifications,
  };

  return services;
};
