import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types';
import { resetDB } from '../__tests_support__/db';
import {
  TEST_ORCID_PROFILE,
  TEST_TWITTER_PROFILE,
  services,
} from './test.services';

const logger = (global as any).logger;

describe('signups', () => {
  let orcidId: string = '0000-0000-0000-0001';
  let twitterId: string = '123456789';

  let userId: string | undefined;

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

    it('handle orcid code (create new user)', async () => {
      const result = await services.users.handleSignup(PLATFORM.Orcid, {
        code: orcidId,
      });

      if (!result) {
        throw Error('unexpected');
      }

      expect(result.ourAccessToken).to.not.be.undefined;

      userId = result.userId;

      const user = await services.users.repo.getUser(userId);
      expect(user).to.not.be.undefined;
      expect(userId.startsWith('orcid:')).to.be.true;

      if (user && user.orcid && user.orcid.length === 1) {
        expect(user.platformIds).to.include(userId);
        expect(user.orcid[0]).to.not.be.undefined;
        expect(user.orcid[0].user_id).to.eq(orcidId);
        expect(user.orcid[0].profile?.name).to.eq(TEST_ORCID_PROFILE.name);
      }
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

    it('handle twitter signup', async () => {
      if (!userId) {
        throw new Error('unexpected');
      }

      await services.users.handleSignup(
        PLATFORM.Twitter,
        {
          code: twitterId,
        },
        userId
      );

      const user = await services.users.repo.getUser(userId);

      if (!user) {
        throw new Error('user undefined');
      }

      const twitterDetails = user[PLATFORM.Twitter];

      if (!twitterDetails) {
        throw new Error('twitterDetails undefined');
      }

      expect(user.userId).to.eq(userId);
      expect(twitterDetails.length).to.eq(1);
      expect(twitterDetails[0].profile?.id).to.eq(TEST_TWITTER_PROFILE.id);
      expect(twitterDetails[0].write?.accessToken).to.not.be.undefined;
    });
  });
});
