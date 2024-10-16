import { expect } from 'chai';

import { MastodonAccessTokenSignupData } from '../../src/@shared/types/types.mastodon';
import {
  NanupubSignupContext,
  NanupubSignupData,
} from '../../src/@shared/types/types.nanopubs';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { logger } from '../../src/instances/logger';
import '../../src/platforms/twitter/mock/twitter.service.mock';
import { resetDB } from '../utils/db';
import { getNanopubProfile } from '../utils/nanopub.profile';
import { handleTwitterSignupMock } from './reusable/mocked.singup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe('010-signups', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: { signup: true },
    nanopub: 'mock-publish',
    parser: 'mock',
    emailSender: 'spy',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('signup with mocked twitter', () => {
    let userId: string;

    it('signup with twitter', async () => {
      const testUser = testCredentials[0];
      const twitterSignupContext: TwitterSignupContext =
        await services.users.getSignupContext(
          PLATFORM.Twitter,
          testUser.twitter.id
        );
      userId = await handleTwitterSignupMock(services, {
        ...twitterSignupContext,
        code: 'mocked',
      });
    });

    describe('connect nanopub account', () => {
      it('connect nanopub account', async () => {
        await services.db.run(async (manager) => {
          const address =
            '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

          const { profile, rsaKeys } = await getNanopubProfile(address);

          logger.debug(`getNanopubProfile`, { profile });

          /** prepare introNanopub */
          const context =
            await services.users.getSignupContext<NanupubSignupContext>(
              PLATFORM.Nanopub,
              userId,
              profile
            );

          logger.debug(`getNanopubProfile`, { context });

          /** sign intro nanopub */
          if (!context.introNanopubDraft) {
            throw new Error('introNanopub not found');
          }

          const signedIntro = await signNanopublication(
            context.introNanopubDraft,
            rsaKeys
          );

          logger.debug(`getNanopubProfile`, { signedIntro });

          const result = await services.users.handleSignup<NanupubSignupData>(
            PLATFORM.Nanopub,
            { ...profile, introNanopubSigned: signedIntro.rdf() },
            manager,
            userId
          );

          logger.debug(`handleSignup`, { result });

          expect(result).to.be.undefined;

          const user = await services.users.repo.getUser(userId, manager, true);

          logger.debug(`user`, { user });

          expect(user).to.not.be.undefined;
        });
      });
    });
    describe('connect mastodon account', () => {
      it('connect mastodon account', async () => {
        await services.db.run(async (manager) => {
          const mastodonCredentials = testCredentials[0].mastodon;
          const result =
            await services.users.handleSignup<MastodonAccessTokenSignupData>(
              PLATFORM.Mastodon,
              {
                accessToken: mastodonCredentials.accessToken,
                mastodonServer: mastodonCredentials.mastodonServer,
                type: 'read',
              },
              manager,
              userId
            );

          logger.debug(`handleSignup`, { result });

          expect(result).to.be.undefined;

          const user = await services.users.repo.getUser(userId, manager, true);

          logger.debug(`user`, { user });

          expect(user).to.not.be.undefined;
        });
      });
    });
  });

  describe('signup with nanopub', () => {
    it.skip('signup as new user', async () => {
      const { profile, rsaKeys } = await getNanopubProfile(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      );

      /** prepare introNanopub */
      const context =
        await services.users.getSignupContext<NanupubSignupContext>(
          PLATFORM.Nanopub,
          undefined,
          profile
        );

      /** sign intro nanopub */
      if (!context.introNanopubDraft) {
        throw new Error('introNanopub not found');
      }

      const signedIntro = await signNanopublication(
        context.introNanopubDraft,
        rsaKeys
      );

      /** send signed to the backend */
      const result = await services.db.run((manager) =>
        services.users.handleSignup<NanupubSignupData>(
          PLATFORM.Nanopub,
          { ...profile, introNanopubDraft: signedIntro.rdf() },
          manager
        )
      );

      expect(result).to.not.be.undefined;
      if (!result) throw new Error(`Unexpected result: ${result}`);

      expect(result.userId).to.not.be.undefined;
    });
  });
});
