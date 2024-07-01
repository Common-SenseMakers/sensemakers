import { expect } from 'chai';

import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { handleSignupMock, userId } from './reusable/mocked.singup';
import { getTestServices } from './test.services';

const EMAIL_TEST = 'cs@sensenets.xyz';

describe.only('012-email verification', () => {
  const services = getTestServices({
    time: 'real',
    twitter: 'mock-signup',
    nanopub: 'mock-publish',
    parser: 'mock',
    notifications: 'spy',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('verifies email', () => {
    it('signup with twitter', async () => {
      await handleSignupMock(services);
    });

    it('set email', async () => {
      await services.users.updateEmail(userId, EMAIL_TEST);

      const userRead = await services.db.run(async (manager) =>
        services.users.repo.getUser(userId, manager, true)
      );

      expect(userRead).to.not.be.undefined;
      expect(userRead.email).to.not.be.undefined;
      expect(userRead.email?.email).to.eq(EMAIL_TEST);
      expect(userRead.email?.verified).to.eq(false);
    });
  });
});
