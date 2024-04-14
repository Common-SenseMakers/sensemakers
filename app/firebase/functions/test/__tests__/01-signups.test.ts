import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types';
import { resetDB } from '../__tests_support__/db';
import { getTestServices } from './test.services';

const logger = (global as any).logger;

describe('01-signups', () => {
  const services = getTestServices();
  let userId: string = 'twitter:123456789';

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('connect orcid', () => {
    it('get orcid authlink', async () => {
      const { link } = await services.users.getSignupContext(PLATFORM.Orcid);
      logger.debug(`link: ${link}`);
      expect(link.startsWith('https://orcid.org')).to.be.true;
    });
  });

  describe('connect twitter', () => {
    it('get twitter oauth details', async () => {
      if (!userId) {
        throw new Error('unexpected');
      }

      const details = await services.users.getSignupContext(
        PLATFORM.Twitter,
        userId,
        {
          callback_url: '',
        }
      );

      logger.debug(`details:`, { details });
      expect(details).to.not.be.undefined;

      expect(details.callback_url).to.not.be.undefined;
      expect(details.codeChallenge).to.not.be.undefined;
      expect(details.codeVerifier).to.not.be.undefined;
      expect(details.state).to.not.be.undefined;
      expect(details.url.startsWith('https://twitter.com')).to.be.true;
    });
  });
});
