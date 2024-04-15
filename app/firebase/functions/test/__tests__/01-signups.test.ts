import { Nanopub, NpProfile } from '@nanopub/sign';
import { expect } from 'chai';
import { privateKeyToAccount } from 'viem/accounts';

import { PLATFORM } from '../../src/@shared/types/types';
import {
  NanopubUserProfile,
  NanupubSignupData,
} from '../../src/@shared/types/types.nanopubs';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { cleanPrivateKey } from '../../src/@shared/utils/semantics.helper';
import {
  DETERMINISTIC_MESSAGE,
  getEthToRSAMessage,
} from '../../src/@shared/utils/sig.utils';
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

  describe.only('connect nanopub', () => {
    it('signup new user', async () => {
      const ethAccount = privateKeyToAccount(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      );

      /** derive RSA keys */
      const seed = await ethAccount.signMessage({
        message: DETERMINISTIC_MESSAGE,
      });
      const rsaKeys = getRSAKeys(seed);

      /** confirm ownership */
      const message = getEthToRSAMessage(rsaKeys.publicKey);
      const ethToRsaSignature = await ethAccount.signMessage({ message });

      const nanopubProfile: NanupubSignupData = {
        rsaPublickey: rsaKeys.publicKey,
        ethAddress: ethAccount.publicKey,
        ethToRsaSignature,
      };

      /** prepare introNanopub */
      const context = await services.users.getSignupContext<NanopubUserProfile>(
        PLATFORM.Nanopub,
        undefined,
        nanopubProfile
      );

      /** sign intro nanopub */
      const introObj = new Nanopub(context.introNanopub);
      const keyBody = cleanPrivateKey(rsaKeys);
      const profile = new NpProfile(keyBody, '', '', '');
      const signedIntro = introObj.sign(profile);

      /** send signed to the backend */
      const result = await services.db.run((manager) =>
        services.users.handleSignup<NanupubSignupData>(
          PLATFORM.Nanopub,
          { ...nanopubProfile, introNanopub: signedIntro.rdf() },
          manager
        )
      );

      expect(result).to.not.be.undefined;
      if (!result) throw new Error(`Unexpected result: ${result}`);

      expect(result.userId).to.not.be.undefined;
    });
  });
});
