import AtpAgent from '@atproto/api';

import { BlueskyAccountDetails } from '../../src/@shared/types/types.bluesky';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import {
  AppUser,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';
import { BLUESKY_SERVICE_URL } from '../../src/config/config.runtime';
import { TransactionManager } from '../../src/db/transaction.manager';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { handleTwitterSignupMock } from '../__tests__/reusable/mocked.singup';
import { USE_REAL_BLUESKY, USE_REAL_TWITTER } from '../__tests__/setup';
import { TestServices } from '../__tests__/test.services';
import { authenticateTwitterUser } from './authenticate.twitter';

export const authenticateTestUsers = async (
  credentials: TestUserCredentials[],
  services: TestServices,
  manager: TransactionManager
) => {
  return Promise.all(
    credentials.map((credential) =>
      authenticateTestUser(credential, services, manager)
    )
  );
};

export const authenticateTestUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  excludePlatforms: PLATFORM[] = []
): Promise<AppUser> => {
  let user: AppUser | undefined;

  if (!excludePlatforms.includes(PLATFORM.Twitter)) {
    user = await authenticateTwitterForUser(
      credentials,
      services,
      manager,
      user
    );
  }

  if (!excludePlatforms.includes(PLATFORM.Mastodon)) {
    user = await authenticateMastodonForUser(
      credentials,
      services,
      manager,
      user
    );
  }

  if (!excludePlatforms.includes(PLATFORM.Bluesky)) {
    user = await authenticateBlueskyForUser(
      credentials,
      services,
      manager,
      user
    );
  }

  if (!user) {
    throw new Error('No platforms were authenticated');
  }

  return user;
};

const authenticateBlueskyForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<AppUser> => {
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

  return user;
};

const authenticateTwitterForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<AppUser> => {
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

    return services.users.repo.getUser(userId, manager, true);
  }
};

const authenticateMastodonForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<AppUser> => {
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

  return user;
};
