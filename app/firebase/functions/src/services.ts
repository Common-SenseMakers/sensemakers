import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY } from './config/config';
import { DBInstance } from './db/instance';
import { OrcidService } from './platforms/orcid/orcid.service';
import { TwitterService } from './platforms/twitter/twitter.service';
import { UsersRepository } from './users/users.repository';
import { UsersService } from './users/users.service';

const db = new DBInstance();
const userRepo = new UsersRepository(db);

const usersService = new UsersService(userRepo);

export const services = {
  users: usersService,
  orcid: new OrcidService(usersService),
  twitter: new TwitterService(usersService, {
    key: TWITTER_API_KEY,
    secret: TWITTER_API_SECRET_KEY,
  }),
};
