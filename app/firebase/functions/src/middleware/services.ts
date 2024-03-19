import { RequestHandler } from 'express';

import { PLATFORM } from '../@shared/types';
import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
} from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { OrcidService } from '../platforms/orcid/orcid.service';
import { IdentityPlatforms } from '../platforms/platforms.interface';
import { TwitterService } from '../platforms/twitter/twitter.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';

const db = new DBInstance();
const userRepo = new UsersRepository(db);
const identityServices: IdentityPlatforms = new Map();

/** mocked orcid */
const orcid = new OrcidService();

/** mocked twitter */
const twitter = new TwitterService({
  key: TWITTER_API_KEY,
  secret: TWITTER_API_SECRET_KEY,
});

/** all identity services */
identityServices.set(PLATFORM.Orcid, orcid);
identityServices.set(PLATFORM.Twitter, twitter);

/** users service */
const usersService = new UsersService(userRepo, identityServices);

const services = {
  users: usersService,
};

export type Services = typeof services;

export const attachServices: RequestHandler = async (
  request,
  response,
  next
) => {
  (request as any).services = services;

  return next();
};
