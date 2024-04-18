import { Nanopub, NpProfile } from '@nanopub/sign';
import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types';
import {
  NanopubUserProfile,
  NanupubSignupData,
} from '../../src/@shared/types/types.nanopubs';
import { cleanPrivateKey } from '../../src/@shared/utils/semantics.helper';
import { resetDB } from '../utils/db';
import { getNanopubProfile } from '../utils/nanopub.profile';
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

  describe('connect nanopub', () => {
    it('signup new user', async () => {
      const { profile, rsaKeys } = await getNanopubProfile(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      );

      /** prepare introNanopub */
      const context = await services.users.getSignupContext<NanopubUserProfile>(
        PLATFORM.Nanopub,
        undefined,
        profile
      );

      /** sign intro nanopub */
      const introObj = new Nanopub(context.introNanopub);
      const keyBody = cleanPrivateKey(rsaKeys);
      const npProfile = new NpProfile(keyBody, '', '', '');
      const signedIntro = introObj.sign(npProfile);

      /** send signed to the backend */
      const result = await services.db.run((manager) =>
        services.users.handleSignup<NanupubSignupData>(
          PLATFORM.Nanopub,
          { ...profile, introNanopub: signedIntro.rdf() },
          manager
        )
      );

      expect(result).to.not.be.undefined;
      if (!result) throw new Error(`Unexpected result: ${result}`);

      expect(result.userId).to.not.be.undefined;
    });
  });
});
