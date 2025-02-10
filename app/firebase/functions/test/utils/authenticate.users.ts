import { BlueskySignupData } from '../../src/@shared/types/types.bluesky';
import { MastodonAccessTokenSignupData } from '../../src/@shared/types/types.mastodon';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  AppUser,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';
import { parseMastodonGlobalUsername } from '../../src/@shared/utils/mastodon.utils';
import { getProfileId } from '../../src/@shared/utils/profiles.utils';
import { TransactionManager } from '../../src/db/transaction.manager';
import { getPrefixedUserId } from '../../src/users/users.utils';
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
  let user: AppUser = {
    userId: credentials.userId,
    clerkId: credentials.clerkId,
    settings: {},
    signupDate: Date.now(),
    accounts: {},
    accountsIds: [],
  };

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
  _user?: AppUser
): Promise<AppUser> => {
  let user: AppUser | undefined = _user;

  if (!user) {
    user = {
      userId: getPrefixedUserId(PLATFORM.Bluesky, credentials.bluesky.id),
      clerkId: '',
      settings: {},
      signupDate: Date.now(),
      accounts: {},
      accountsIds: [getProfileId(PLATFORM.Bluesky, credentials.bluesky.id)],
      clerkId: 'clerk-id',
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
  user: AppUser
): Promise<AppUser> => {
  return authenticateTwitterUser(
    credentials.twitter,
    services,
    manager,
    user.userId
  );
};

const authenticateMastodonForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<AppUser> => {
  if (!user) {
    user = {
      clerkId: '',
      userId: getPrefixedUserId(PLATFORM.Mastodon, credentials.mastodon.id),
      settings: {},
      signupDate: Date.now(),
      accounts: {},
      accountsIds: [getProfileId(PLATFORM.Mastodon, credentials.mastodon.id)],
      clerkId: 'clerk-id',
    };
  }

  const mastodonServer = parseMastodonGlobalUsername(
    credentials.mastodon.username
  ).server;

  user.accounts[PLATFORM.Mastodon] = [
    {
      signupDate: 0,
      user_id: `https://${mastodonServer}/@${credentials.mastodon.username}`,
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

  // return user;
  const signupData: MastodonAccessTokenSignupData = {
    mastodonServer,
    accessToken: credentials.mastodon.accessToken,
    type: 'write',
  };

  await services.users.handleSignup(
    PLATFORM.Mastodon,
    signupData,
    manager,
    user.userId
  );

  user = await services.users.repo.getUser(user.userId, manager, true);

  return user;
};
