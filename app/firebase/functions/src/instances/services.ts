import { PLATFORM } from '../@shared/types/types';
import {
  FUNCTIONS_PY_URL,
  OUR_EXPIRES_IN,
  OUR_TOKEN_SECRET,
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
} from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { ParserService } from '../parser/parser.service';
import { OrcidService } from '../platforms/orcid/orcid.service';
import {
  IdentityServicesMap,
  PlatformsMap,
  PlatformsService,
} from '../platforms/platforms.service';
import { TwitterService } from '../platforms/twitter/twitter.service';
import { PostsManager } from '../posts/posts.manager';
import { PostsProcessing } from '../posts/posts.processing';
import { PostsRepository } from '../posts/posts.repository';
import { TimeService } from '../time/time.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

export interface Services {
  users: UsersService;
  postsProcessing: PostsProcessing;
  postsManager: PostsManager;
  platforms: PlatformsService;
}

export const createServices = () => {
  const db = new DBInstance();
  const userRepo = new UsersRepository(db);
  const postsRepo = new PostsRepository(db);

  const identityPlatforms: IdentityServicesMap = new Map();
  const platformsMap: PlatformsMap = new Map();
  const time = new TimeService();

  const orcid = new OrcidService();
  const twitter = new TwitterService(time, userRepo, {
    clientId: TWITTER_CLIENT_ID.value(),
    clientSecret: TWITTER_CLIENT_SECRET.value(),
  });

  /** all identity services */
  identityPlatforms.set(PLATFORM.Orcid, orcid);
  identityPlatforms.set(PLATFORM.Twitter, twitter);

  /** all platforms */
  platformsMap.set(PLATFORM.Twitter, twitter);

  /** users service */
  const usersService = new UsersService(userRepo, identityPlatforms, {
    tokenSecret: OUR_TOKEN_SECRET.value(),
    expiresIn: OUR_EXPIRES_IN,
  });

  /** platforms service */
  const platformsService = new PlatformsService(platformsMap);

  /** parser service */
  const parserService = new ParserService(FUNCTIONS_PY_URL);

  /** posts service */
  const postsProcessing = new PostsProcessing(platformsService, parserService);
  const postsManager = new PostsManager(
    usersService,
    postsRepo,
    postsProcessing,
    platformsService
  );

  /** all services */
  const services: Services = {
    users: usersService,
    postsProcessing: postsProcessing,
    postsManager: postsManager,
    platforms: platformsService,
  };

  return services;
};
