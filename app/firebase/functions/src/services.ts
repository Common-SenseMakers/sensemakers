import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY } from './config/config';
import { DBInstance } from './db/instance';
import { TwitterService } from './platforms/twitter/twitter.service';
import { UsersRepository } from './users/users.repository';
import { UsersService } from './users/users.service';

const db = new DBInstance();
const userRepo = new UsersRepository(db);

export const services = {
  users: new UsersService(userRepo),
  twitter: new TwitterService(userRepo, {
    key: TWITTER_API_KEY,
    secret: TWITTER_API_SECRET_KEY,
  }),
};
