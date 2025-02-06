import { expect } from 'chai';

import {
  BlueskyCredentials,
  BlueskySignupData,
} from '../../src/@shared/types/types.bluesky';
import {
  IDENTITY_PLATFORM,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../../src/@shared/types/types.platforms';
import {
  TwitterCredentials,
  TwitterSignupData,
} from '../../src/@shared/types/types.twitter';
import {
  AccountCredentials,
  AppUser,
} from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe.only('023 Account Reconnect', () => {
  const platforms = [
    // { name: 'Bluesky', platform: PLATFORM.Bluesky },
    { name: 'Twitter', platform: PLATFORM.Twitter },
    // { name: 'Mastodon', platform: PLATFORM.Mastodon },
  ];

  platforms.forEach(({ name, platform }) => {
    describe(`${name} Account Reconnect`, () => {
      let user: AppUser | undefined;

      const services = getTestServices({
        time: 'real',
        twitter: USE_REAL_TWITTER
          ? { signup: true }
          : { publish: true, signup: true, fetch: true, get: true },
        bluesky: USE_REAL_BLUESKY
          ? undefined
          : { publish: true, signup: true, fetch: true, get: true },
        mastodon: USE_REAL_MASTODON
          ? undefined
          : { publish: true, signup: true, fetch: true, get: true },
        parser: USE_REAL_PARSER ? 'real' : 'mock',
      });

      before(async () => {
        logger.debug('resetting DB');
        await resetDB();

        await services.db.run(async (manager) => {
          const users = await createUsers(
            services,
            Array.from(testUsers.values()),
            manager
          );
          const testUser = testCredentials[0];

          user = users.find(
            (u) =>
              UsersHelper.getAccount(
                u,
                platform as IDENTITY_PLATFORM,
                testUser[platform as PUBLISHABLE_PLATFORM].id
              ) !== undefined
          );
        });
      });

      it('marks an account as disconnected if the client fails to instantiate', async () => {
        if (!user) {
          throw new Error('appUser not created');
        }
        const allUserDetails = user.accounts[platform as IDENTITY_PLATFORM];
        if (!allUserDetails || allUserDetails.length < 0) {
          throw new Error('Unexpected');
        }
        const userDetails = allUserDetails[0];
        const testUser = testCredentials[0];
        const wrongCredentials = (() => {
          if (platform === PLATFORM.Bluesky) {
            return {
              read: {
                session: {
                  refreshJwt: '1234',
                  accessJwt: '1234',
                  handle: testUser[platform].username,
                  did: testUser[platform].id,
                  active: true,
                },
                credentials: {
                  identifier: testUser.bluesky.id,
                  password: 'wrong-password',
                },
              },
            } as AccountCredentials<BlueskyCredentials, BlueskyCredentials>;
          }
          return {
            read: {
              accessToken: '1234',
              refreshToken: '1234',
              expiresIn: 1,
              expiresAtMs: Date.now() - 10 * 24 * 60 * 60 * 1000,
            },
          } as AccountCredentials<TwitterCredentials, TwitterCredentials>;
        })();

        await services.db.run(async (manager) => {
          return services.users.updateAccountCredentials(
            user!.userId,
            platform,
            userDetails.user_id,
            wrongCredentials,
            manager
          );
        });

        await services.db.run(async (manager) => {
          return services.postsManager.fetchAccount(
            platform,
            userDetails.user_id,
            {
              expectedAmount: 1,
            },
            manager,
            wrongCredentials,
            user!.userId
          );
        });

        let appUserRead = await services.db.run(async (manager) => {
          return services.users.getLoggedUserWithProfiles(
            user!.userId,
            manager
          );
        });

        expect(
          appUserRead.profiles[platform as IDENTITY_PLATFORM]?.[0]
            .isDisconnected
        ).to.be.true;

        await services.db.run(async (manager) => {
          const signupData = (() => {
            if (platform === PLATFORM.Bluesky) {
              const bskySignupData: BlueskySignupData = {
                username: testUser.bluesky.username,
                appPassword: testUser.bluesky.appPassword,
                type: 'read',
              };
              return bskySignupData;
            }
            const twitterSignupData: TwitterSignupData = {
              url: 'callback_url',
              code: '1234',
              codeVerifier: '1234',
              state: '1234',
              codeChallenge: testUser.twitter.id,
              callback_url: 'callback_url',
              type: 'read',
            };
            return twitterSignupData;
          })();
          return services.users.handleSignup(
            platform as IDENTITY_PLATFORM,
            signupData,
            manager,
            user!.userId
          );
        });
        appUserRead = await services.db.run(async (manager) => {
          return services.users.getLoggedUserWithProfiles(
            user!.userId,
            manager
          );
        });

        expect(
          appUserRead.profiles[platform as IDENTITY_PLATFORM]?.[0]
            .isDisconnected
        ).to.be.false;
      });
    });
  });
});
