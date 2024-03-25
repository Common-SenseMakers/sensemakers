import { PLATFORM } from '../@shared/types';
import {
  OUR_EXPIRES_IN,
  OUR_TOKEN_SECRET,
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
} from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { OrcidService } from '../platforms/orcid/orcid.service';
import {
  IdentityServicesMap,
  PlatformsMap,
  PlatformsService,
} from '../platforms/platforms.service';
import { TwitterService } from '../platforms/twitter/twitter.service';
import { PostsService } from '../posts/PostsService';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

export interface Services {
  users: UsersService;
  posts: PostsService;
  platforms: PlatformsService;
}

export const createServices = () => {
  const db = new DBInstance();
  const userRepo = new UsersRepository(db);
  const identityPlatforms: IdentityServicesMap = new Map();
  const platformsMap: PlatformsMap = new Map();

  const orcid = new OrcidService();
  const twitter = new TwitterService({
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

  /** posts service */
  const postsService = new PostsService(usersService, platformsService);

  /** all services */
  const services: Services = {
    users: usersService,
    posts: postsService,
    platforms: platformsService,
  };

  return services;
};
