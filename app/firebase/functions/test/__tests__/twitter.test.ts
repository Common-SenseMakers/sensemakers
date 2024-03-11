import { expect } from 'chai';

import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
} from '../../src/config/config';
import { DBInstance } from '../../src/db/instance';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersRepository } from '../../src/users/users.repository';
import { UsersService } from '../../src/users/users.service';

describe('twitter', () => {
  let services: {
    users: UsersService;
  };

  let twitter: TwitterService;

  let userId: string;

  before(async () => {
    const db = new DBInstance();
    const userRepo = new UsersRepository(db);

    services = {
      users: new UsersService(userRepo),
    };

    twitter = new TwitterService(userRepo, {
      key: TWITTER_API_KEY,
      secret: TWITTER_API_SECRET_KEY,
    });

    userId = await services.users.create({
      orcid: {
        name: 'Test User',
        orcid: '0000-0000-0000-1234',
      },
    });
  });

  it('getAuthLink', async () => {
    const link = await twitter.getAuthLink(userId);
    expect(link).to.not.be.undefined;
  });
});
