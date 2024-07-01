import { expect } from 'chai';
import { anything, capture, verify } from 'ts-mockito';

import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { handleSignupMock, userId } from './reusable/mocked.singup';
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

  describe.only('verifies email', () => {
    let tokenRead: string | undefined;

    it('signup with twitter', async () => {
      await handleSignupMock(services);
    });

    it('set email', async () => {
      await services.users.setEmail(userId, EMAIL_TEST);

      const userRead = await services.db.run(async (manager) =>
        services.users.repo.getUser(userId, manager, true)
      );

      expect(userRead).to.not.be.undefined;
      expect(userRead.email).to.not.be.undefined;
      expect(userRead.email?.email).to.eq(EMAIL_TEST);
      expect(userRead.email?.verified).to.eq(false);
      expect(userRead.email?.token).to.to.not.be.undefined;

      tokenRead = userRead.email?.token;

      /** expect verification to have been sent */

      const emailMock = services.emailMock;
      if (!emailMock) {
        throw new Error('notificationsMock not created');
      }

      verify(emailMock.sendVerificationEmail(anything())).once();

      const [capturedUser] = capture(emailMock.sendVerificationEmail).last();

      expect(capturedUser.userId).to.equal(userId);
      expect(capturedUser.email).to.not.be.undefined;
      expect(capturedUser.email?.token).to.not.be.undefined;
    });

    it('wont verify email if wrong token', async () => {
      if (!tokenRead) {
        throw new Error('unexpected');
      }

      try {
        await services.users.verifyEmail(userId, 'WRONT TOKEN');
        expect(true, 'verifyEmail did not failed').to.eq(false);
      } catch (error: any) {
        expect(error.message).to.include('Token does not match');
      }
    });

    it('verifies email', async () => {
      if (!tokenRead) {
        throw new Error('unexpected');
      }

      await services.users.verifyEmail(userId, tokenRead);

      const userRead = await services.db.run(async (manager) =>
        services.users.repo.getUser(userId, manager, true)
      );

      expect(userRead.email?.email).to.eq(EMAIL_TEST);
      expect(userRead.email?.verified).to.eq(true);
      expect(userRead.email?.token).to.to.not.be.undefined;
    });
  });
});
