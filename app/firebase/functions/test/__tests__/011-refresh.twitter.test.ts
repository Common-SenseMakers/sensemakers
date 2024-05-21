import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

describe('011-twitter refresh', () => {
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    await services.db.run(async (manager) => {
      const users = await createUsers(
        services,
        Array.from(testUsers.values()),
        manager
      );
      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Twitter, TWITTER_USER_ID_MOCKS) !==
          undefined
      );
    });
  });

  describe('refresh token', () => {
    it('refresh token', async () => {
      const twitterService = (services.platforms as any).platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;

      await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const account = UsersHelper.getAccount(user, PLATFORM.Twitter);

        (services.time as any).set(account?.read.expiresAtMs);

        const client = await (twitterService as any).getUserClient(
          account?.user_id,
          'read',
          manager
        );

        expect(client).to.not.be.undefined;
      });

      expect(user).to.not.be.undefined;
    });
  });
});
