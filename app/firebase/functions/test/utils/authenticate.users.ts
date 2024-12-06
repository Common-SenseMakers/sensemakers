import { BlueskySignupData } from '../../src/@shared/types/types.bluesky';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import {
  AppUser,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';
import { getProfileId } from '../../src/@shared/utils/profiles.utils';
import { TransactionManager } from '../../src/db/transaction.manager';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { handleTwitterSignupMock } from '../__tests__/reusable/mocked.singup';
import { USE_REAL_TWITTER } from '../__tests__/setup';
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
): Promise<AppUser> => {
  let user: AppUser | undefined;

  if (includePlatforms.includes(PLATFORM.Twitter)) {
    const twitterUser = await authenticateTwitterForUser(
      credentials,
      services,
      manager,
      user
    );

    user = twitterUser;
  }

  if (includePlatforms.includes(PLATFORM.Mastodon)) {
    const mastodonUser = await authenticateMastodonForUser(
      credentials,
      services,
      manager,
      user
    );

    user = mastodonUser;
  }

  if (includePlatforms.includes(PLATFORM.Bluesky)) {
    const bskUser = await authenticateBlueskyForUser(
      credentials,
      services,
      manager,
      user
    );

    user = bskUser;
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
      accountsIds: [getProfileId(PLATFORM.Bluesky, credentials.bluesky.id)],
    };
  }

  const signupData: BlueskySignupData = {
    username: credentials.bluesky.username,
    appPassword: credentials.bluesky.appPassword,
    type: 'write',
  };

  await services.users.handleSignup(
    PLATFORM.Bluesky,
    signupData,
    manager,
    user.userId
  );

  user = await services.users.repo.getUser(user.userId, manager, true);

  return user;
};

export const authenticateTwitterForUser = async (
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

    const userRead = await services.users.repo.getUser(userId, manager, true);
    return userRead;
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
      accountsIds: [getProfileId(PLATFORM.Mastodon, credentials.mastodon.id)],
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
