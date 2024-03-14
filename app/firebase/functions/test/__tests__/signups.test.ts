import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types';
import { OrcidService } from '../../src/platforms/orcid/orcid.service';
import { TEST_USER_NAME, services } from './test.services';

const logger = (global as any).logger;

const orcid = services.users.platforms.get(PLATFORM.Orcid) as OrcidService;

describe('signups', () => {
  let orcidId: string = '0000-0000-0000-0001';

  describe('connect orcid', () => {
    it('get orcid authlink', async () => {
      const { link } = await orcid.getSignupContext();
      logger.debug(`link: ${link}`);
      expect(link).to.not.be.undefined;
    });

    it('handle orcid code (create new user)', async () => {
      const userId = await services.users.handleSignup(PLATFORM.Orcid, {
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

    describe('connect twitter', () => {});
  });
});
