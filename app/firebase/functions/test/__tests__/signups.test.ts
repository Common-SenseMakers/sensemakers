import { expect } from 'chai';

import { services } from '../../src/services';

const logger = (global as any).logger;

describe('signups', () => {
  let orcidId: string = '0000-0000-0000-0001';

  describe('connect orcid', () => {
    it('get orcid authlink', async () => {
      const link = await services.orcid.getAuthLink();
      logger.debug(`link: ${link}`);
      expect(link).to.not.be.undefined;
    });

    it('handle orcid code (create new user)', async () => {
      const userId = await services.users.handleSignupData(orcidId);
      const expectedUserId = services.users.getUserId({
        orcid: { orcid: orcidId, name: '' },
      });

      expect(userId).to.eq(expectedUserId);

      const user = await services.users.repo.getUser(userId);
      expect(user).to.not.be.undefined;

      if (user && user.orcid) {
        expect(user.orcid).to.not.be.undefined;
        expect(user.orcid.orcid).to.eq(orcidId);
        expect(user.orcid.name).to.eq('Test User');
      }
    });

    describe('connect twitter', () => {
      it('handle twitter code', async () => {
        const userId = await services.twitter.handleCode(orcidId);
      });
    });
  });
});
