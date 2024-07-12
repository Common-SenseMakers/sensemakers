import { expect } from 'chai';

import { TwitterUserDetails } from '../../src/@shared/types/types.twitter';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { handleSignupMock } from './reusable/mocked.singup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

const EMAIL_TEST = 'cs@sensenets.xyz';

describe('012-email verification', () => {
  const services = getTestServices({
    time: 'real',
    twitter: 'mock-signup',
    nanopub: 'mock-publish',
    parser: 'mock',
    emailSender: 'spy',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('verifies email', () => {
    let userId: string;

    it('signup with twitter', async () => {
      const signupData: TwitterUserDetails = {
        user_id: testCredentials[0].twitter.id,
        profile: {
          id: testCredentials[0].twitter.id,
          name: testCredentials[0].twitter.username,
          username: testCredentials[0].twitter.username,
        },
        signupDate: Date.now(),
      };

      userId = await handleSignupMock(services, signupData);
    });

    it('set email', async () => {
      await services.users.setEmail(userId, {
        email: EMAIL_TEST,
        source: 'MAGIC',
      });

      const userRead = await services.db.run(async (manager) =>
        services.users.repo.getUser(userId, manager, true)
      );

      expect(userRead).to.not.be.undefined;
      expect(userRead.email).to.not.be.undefined;
      expect(userRead.email?.email).to.eq(EMAIL_TEST);
    });
  });
});
