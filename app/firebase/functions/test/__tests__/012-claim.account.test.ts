import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { getProfileId } from '../../src/@shared/utils/profiles.utils';
import { logger } from '../../src/instances/logger';
import { UsersHelper } from '../../src/users/users.helper';
import { authenticateTwitterForUser } from '../utils/authenticate.users';
import { resetDB } from '../utils/db';
import { USE_REAL_PARSER, USE_REAL_TWITTER, testUsers } from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe('012-claim-account', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? undefined : { publish: true, signup: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('signup to exisiting profile', () => {
    it('fetch profile', async () => {
      const account = UsersHelper.getAccount(
        testUsers[0].user,
        PLATFORM.Twitter,
        undefined,
        true
      );

      await services.db.run((manager) =>
        services.postsManager.fetchAccount(
          PLATFORM.Twitter,
          account.user_id,
          { expectedAmount: 10 },
          manager
        )
      );

      const profile = await services.db.run((manager) =>
        services.users.profiles.getByProfileId(
          getProfileId(PLATFORM.Twitter, account.user_id),
          manager,
          true
        )
      );

      expect(profile).to.not.be.undefined;
    });

    it('signup user', async () => {
      const credentials = testCredentials[0];
      const twitterUser = await services.db.run((manager) =>
        authenticateTwitterForUser(credentials, services, manager, undefined)
      );

      /** update userId of posts and profiles */
      await services.postsManager.linkExistingUser(twitterUser.userId);

      expect(twitterUser).to.not.be.undefined;
    });
  });
});
