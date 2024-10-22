import { expect } from 'chai';

import { MastodonAccessTokenSignupData } from '../../src/@shared/types/types.mastodon';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import { logger } from '../../src/instances/logger';
import '../../src/platforms/twitter/mock/twitter.service.mock';
import { resetDB } from '../utils/db';
import { handleTwitterSignupMock } from './reusable/mocked.singup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe('010-signups', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: { signup: true },
    parser: 'mock',
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
});
