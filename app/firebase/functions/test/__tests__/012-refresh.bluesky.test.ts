import { expect } from 'chai';
import * as jwt from 'jsonwebtoken';

import { AccessJwtPayload } from '../../src/@shared/types/types.bluesky';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { BlueskyService } from '../../src/platforms/bluesky/bluesky.service';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_BLUESKY,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

describe('011-bluesky refresh', () => {
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    bluesky: USE_REAL_BLUESKY ? undefined : { publish: true, signup: true },
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    const users = await services.db.run(async (manager) => {
      return createUsers(services, testUsers, manager);
    });

    user = users.find(
      (u) => UsersHelper.getAccount(u, PLATFORM.Bluesky) !== undefined
    );
  });

  describe('refresh token through getOfUser', () => {
    it('refresh token', async () => {
      if (!user) {
        throw new Error('unexpected');
      }
      if (!USE_REAL_BLUESKY) {
        /** only run this test on a real bluesky service */
        return;
      }

      const blueskyService = (services.platforms as any).platforms.get(
        PLATFORM.Bluesky
      ) as BlueskyService;

      /** read the expireTime */
      const account1 = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user.userId,
          manager,
          true
        );

        return UsersHelper.getAccount(
          userRead,
          PLATFORM.Bluesky,
          undefined,
          true
        );
      });

      logger.debug(`account ${account1.credentials.read?.accessJwt}`, {
        account: account1,
      });

      /** credentials should be valid */
      const post_id =
        'at://did:plc:44ybard66vv44zksje25o7dz/app.bsky.feed.post/3l4z5c5ziuk2b';
      const post = await blueskyService.get(post_id, account1.credentials);
      expect(post).to.not.be.undefined;

      /** set the mock time service time to that value */
      if (!account1.credentials.read?.accessJwt) {
        throw new Error('no accessJwt');
      }
      const decodedAccessJwt1 = jwt.decode(
        account1.credentials.read.accessJwt
      ) as AccessJwtPayload;

      /** set time to 40 minutes after token created so that it is still valid */
      (services.time as any).set(decodedAccessJwt1.iat * 1000 + 1000 * 60 * 40);

      // call getOfUsers (this should NOT update the refresh token)
      void (await services.postsManager.getOfUser({
        userId: user?.userId,
        fetchParams: { expectedAmount: 1 },
        origins: [PLATFORM.Bluesky],
      }));

      const account2 = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user.userId,
          manager,
          true
        );

        return UsersHelper.getAccount(
          userRead,
          PLATFORM.Bluesky,
          undefined,
          true
        );
      });

      logger.debug(`accountAfter ${account2.credentials.read?.accessJwt}`, {
        accountAfter: account2,
      });

      /** same credentials should be valid */
      const post2 = await blueskyService.get(post_id, account2.credentials);
      expect(post2).to.not.be.undefined;

      expect(account1.credentials.read?.accessJwt).to.equal(
        account2.credentials.read?.accessJwt
      );

      const decodedAccessJwt2 = jwt.decode(
        account2.credentials.read.accessJwt
      ) as AccessJwtPayload;

      /** set the mock time to 65 minutes after token creation to trigger a refresh */
      (services.time as any).set(decodedAccessJwt2.iat * 1000 + 1000 * 60 * 65);

      // call getOfUsers (this should update the refresh token again)
      void (await services.postsManager.getOfUser({
        userId: user?.userId,
        fetchParams: { expectedAmount: 50 },
        origins: [PLATFORM.Bluesky],
      }));

      const account3 = await services.db.run(async (manager) => {
        if (!user) {
          throw new Error('unexpected');
        }

        const userRead = await services.users.repo.getUser(
          user.userId,
          manager,
          true
        );

        return UsersHelper.getAccount(
          userRead,
          PLATFORM.Bluesky,
          undefined,
          true
        );
      });

      const post3 = await blueskyService.get(post_id, account3.credentials);
      expect(post3).to.not.be.undefined;

      expect(account2.credentials.read?.accessJwt).to.not.equal(
        account3.credentials.read?.accessJwt
      );
    });
  });
});
