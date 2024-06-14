import { expect } from 'chai';

import {
  NanopubUserProfile,
  NanupubSignupData,
} from '../../src/@shared/types/types.nanopubs';
import { TwitterUserProfile } from '../../src/@shared/types/types.twitter';
import { PLATFORM } from '../../src/@shared/types/types.user';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { getNanopubProfile } from '../utils/nanopub.profile';
import { getTestServices } from './test.services';

describe('010-signups', () => {
  const services = getTestServices({
    time: 'real',
    twitter: 'mock-signup',
    nanopub: 'mock-publish',
    parser: 'mock',
  });

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

  describe('signup with mocked twitter', () => {
    const TWITTER_USER_ID = '123456789';
    const TWITTER_PROFILE: TwitterUserProfile = {
      id: TWITTER_USER_ID,
      name: 'Test User',
      username: 'username',
    };

    before(() => {
      (this as any).skipUsersUpdate = true;
    });

    it('signup with twitter', async () => {
      if (!userId) {
        throw new Error('unexpected');
      }

      await services.db.run(async (manager) => {
        logger.debug(`handleSignup`, { user_id: TWITTER_USER_ID });

        const result = await services.users.handleSignup(
          PLATFORM.Twitter,
          { user_id: TWITTER_USER_ID, profile: TWITTER_PROFILE },
          manager
        );

        logger.debug(`handleSignup - result `, { result });

        expect(result).to.not.be.undefined;

        if (!result) {
          throw new Error('unexpected');
        }

        expect(result.userId).to.not.be.undefined;
        expect(result.ourAccessToken).to.not.be.undefined;
      });

      await services.db.run(async (manager) => {
        const userRead = await services.users.repo.getUser(userId, manager);
        expect(userRead).to.not.be.undefined;

        const userReadProfile = await services.users.repo.getByPlatformUsername(
          PLATFORM.Twitter,
          'username',
          TWITTER_PROFILE.username,
          manager
        );

        expect(userReadProfile).to.not.be.undefined;
      });
    });

    describe('connect nanopub account', () => {
      it('connect nanopub account', async () => {
        if (!userId) {
          throw new Error('unexpected');
        }

        await services.db.run(async (manager) => {
          const address =
            '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

          const { profile, rsaKeys } = await getNanopubProfile(address);

          logger.debug(`getNanopubProfile`, { profile });

          /** prepare introNanopub */
          const context =
            await services.users.getSignupContext<NanopubUserProfile>(
              PLATFORM.Nanopub,
              undefined,
              profile
            );

          logger.debug(`getNanopubProfile`, { context });

          /** sign intro nanopub */
          if (!context.introNanopub) {
            throw new Error('introNanopub not found');
          }

          const signedIntro = await signNanopublication(
            context.introNanopub,
            rsaKeys
          );

          logger.debug(`getNanopubProfile`, { signedIntro });

          const result = await services.users.handleSignup<NanupubSignupData>(
            PLATFORM.Nanopub,
            { ...profile, introNanopub: signedIntro.rdf() },
            manager,
            userId
          );

          logger.debug(`handleSignup`, { result });

          expect(result).to.be.undefined;

          const user = await services.users.repo.getUser(userId, manager, true);

          logger.debug(`user`, { user });

          expect(user).to.not.be.undefined;
          expect(user.platformIds).to.have.length(2);
        });
      });
    });
  });

  describe('signup with nanopub', () => {
    it('signup as new user', async () => {
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
      if (!context.introNanopub) {
        throw new Error('introNanopub not found');
      }

      const signedIntro = await signNanopublication(
        context.introNanopub,
        rsaKeys
      );

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
