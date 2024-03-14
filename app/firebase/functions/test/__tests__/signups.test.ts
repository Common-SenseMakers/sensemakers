import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types';
import { TEST_USER_NAME, services } from './test.services';

const logger = (global as any).logger;

describe('signups', () => {
  let orcidId: string = '0000-0000-0000-0001';
  let userId: string | undefined;

  describe('connect orcid', () => {
    it('get orcid authlink', async () => {
      const { link } = await services.users.getSignupContext(PLATFORM.Orcid);
      logger.debug(`link: ${link}`);
      expect(link).to.not.be.undefined;
    });

    it('handle orcid code (create new user)', async () => {
      userId = await services.users.handleSignup(PLATFORM.Orcid, {
        code: orcidId,
      });

      const user = await services.users.repo.getUser(userId);
      expect(user).to.not.be.undefined;

      if (user && user.orcid && user.orcid.length === 1) {
        expect(user.orcid[0]).to.not.be.undefined;
        expect(user.orcid[0].user_id).to.eq(orcidId);
        expect(user.orcid[0].name).to.eq(TEST_USER_NAME);
      }
    });
  });

  describe('connect twitter', () => {
    it('get twitter oauth details', async () => {
      const details = await services.users.getSignupContext(
        PLATFORM.Twitter,
        userId
      );

      logger.debug(`details:`, { details });
      expect(details).to.not.be.undefined;
    });
  });
});
