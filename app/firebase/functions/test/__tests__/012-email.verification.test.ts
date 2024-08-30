import { expect } from 'chai';

import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import { PLATFORM } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { handleSignupMock } from './reusable/mocked.singup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

const EMAIL_TEST = 'cs@sensenets.xyz';

describe('012-email verification', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: { signup: true },
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
      const twitterSignupContext: TwitterSignupContext =
        await services.users.getSignupContext(
          PLATFORM.Twitter,
          testCredentials[0].twitter.id
        );

      userId = await handleSignupMock(services, {
        ...twitterSignupContext,
        code: 'mocked',
      });
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
