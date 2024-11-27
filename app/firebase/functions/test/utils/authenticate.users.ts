import AtpAgent from '@atproto/api';

import { BlueskyAccountDetails } from '../../src/@shared/types/types.bluesky';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AccountProfile } from '../../src/@shared/types/types.profiles';
import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import {
  AppUser,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';
import { BLUESKY_SERVICE_URL } from '../../src/config/config.runtime';
import { TransactionManager } from '../../src/db/transaction.manager';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { handleTwitterSignupMock } from '../__tests__/reusable/mocked.singup';
import {
  USE_REAL_BLUESKY,
  USE_REAL_TWITTER,
  UserAndProfiles,
} from '../__tests__/setup';
import { TestServices } from '../__tests__/test.services';
import { authenticateTwitterUser } from './authenticate.twitter';

export const authenticateTestUsers = async (
  credentials: TestUserCredentials[],
  services: TestServices,
  includePlatforms: PLATFORM[],
  manager: TransactionManager
) => {
  return Promise.all(
    credentials.map((credential) =>
      authenticateTestUser(credential, services, includePlatforms, manager)
    )
  );
};

export const authenticateTestUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  includePlatforms: PLATFORM[],
  manager: TransactionManager
): Promise<UserAndProfiles> => {
  let user: AppUser | undefined;
  let profiles: AccountProfile[] = [];

  if (includePlatforms.includes(PLATFORM.Twitter)) {
    const twitterUser = await authenticateTwitterForUser(
      credentials,
      services,
      manager,
      user
    );

    user = twitterUser.user;
    profiles.push(...twitterUser.profiles);
  }

  if (includePlatforms.includes(PLATFORM.Mastodon)) {
    const mastodonUser = await authenticateMastodonForUser(
      credentials,
      services,
      manager,
      user
    );

    user = mastodonUser.user;
    profiles.push(...mastodonUser.profiles);
  }

  if (includePlatforms.includes(PLATFORM.Bluesky)) {
    const bskUser = await authenticateBlueskyForUser(
      credentials,
      services,
      manager,
      user
    );

    user = bskUser.user;
    profiles.push(...bskUser.profiles);
  }

  if (!user) {
    throw new Error('No platforms were authenticated');
  }

  return { user, profiles };
};

const authenticateBlueskyForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<UserAndProfiles> => {
  if (!user) {
    user = {
      userId: getPrefixedUserId(PLATFORM.Bluesky, credentials.bluesky.id),
      settings: {},
      signupDate: Date.now(),
      accounts: {},
    };
  }

  const blueskyCredentials = await (async () => {
    if (USE_REAL_BLUESKY) {
      const agent = new AtpAgent({
        service: BLUESKY_SERVICE_URL,
      });
      await agent.login({
        identifier: credentials.bluesky.username,
        password: credentials.bluesky.appPassword,
      });
      if (!agent.session) {
        throw new Error('Failed to login to bluesky');
      }
      return agent.session;
    }
    return {
      refreshJwt: '1234',
      accessJwt: '1234',
      handle: credentials.bluesky.username,
      did: credentials.bluesky.id,
      active: true,
    };
  })();

  const blueskyUserDetails: BlueskyAccountDetails = {
    signupDate: 0,
    user_id: credentials.bluesky.id,
    credentials: {
      read: blueskyCredentials,
      write: blueskyCredentials,
    },
  };

  user.accounts[PLATFORM.Bluesky] = [blueskyUserDetails];

  return { user, profiles: [] };
};

const authenticateTwitterForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<UserAndProfiles> => {
  if (USE_REAL_TWITTER) {
    return authenticateTwitterUser(
      credentials.twitter,
      services,
      manager,
      user?.userId
    );
  } else {
    const twitterSignupContext: TwitterSignupContext =
      await services.users.getSignupContext(
        PLATFORM.Twitter,
        credentials.twitter.id
      );
    const userId = await handleTwitterSignupMock(
      services,
      {
        ...twitterSignupContext,
        code: 'mocked',
      },
      user?.userId
    );

    const userRead = await services.users.repo.getUser(userId, manager, true);
    return { user: userRead, profiles: [] };
  }
};

const authenticateMastodonForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<UserAndProfiles> => {
  if (!user) {
    user = {
      userId: getPrefixedUserId(PLATFORM.Mastodon, credentials.mastodon.id),
      settings: {},
      signupDate: Date.now(),
      accounts: {},
    };
  }

  user.accounts[PLATFORM.Mastodon] = [
    {
      signupDate: 0,
      user_id: `https://${credentials.mastodon.mastodonServer}/@${credentials.mastodon.username}`,
      credentials: {
        read: {
          accessToken: credentials.mastodon.id,
          server: 'https://mastodon.social',
        },
        write: {
          accessToken: credentials.mastodon.id,
          server: 'https://mastodon.social',
        },
      },
    },
  ];

  return { user, profiles: [] };
};
