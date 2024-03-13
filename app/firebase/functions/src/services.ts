import { PLATFORM } from './@shared/types';
import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY } from './config/config';
import { DBInstance } from './db/instance';
import { IdentityServices } from './platforms/identity.service';
import { OrcidService } from './platforms/orcid/orcid.service';
import { TwitterService } from './platforms/twitter/twitter.service';
import { UsersRepository } from './users/users.repository';
import { UsersService } from './users/users.service';

const db = new DBInstance();
const userRepo = new UsersRepository(db);
const identityServices: IdentityServices = new Map();

identityServices.set(PLATFORM.ORCID, new OrcidService());
identityServices.set(PLATFORM.Nanopubs, new TwitterService());

const usersService = new UsersService(userRepo, identityServices);

export const services = {
  users: usersService,
};
