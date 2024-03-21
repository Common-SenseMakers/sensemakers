import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
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
        expect(user.orcid[0].profile?.name).to.eq(TEST_ORCID_PROFILE.name);
      }
    });
  });

  describe('connect twitter', () => {
    let userId: string;
    let accessToken: string | undefined;

    it('get twitter oauth details', async () => {
      const details = await services.users.getSignupContext(
        PLATFORM.Twitter,
        userId,
        {
          callback_url: '',
        }
      );

      logger.debug(`details:`, { details });
      expect(details).to.not.be.undefined;
    });

    it('handle twitter signup', async () => {
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

      accessToken = twitterDetails[0].write?.accessToken;
      expect(accessToken).to.not.be.undefined;
    });
  });
});
