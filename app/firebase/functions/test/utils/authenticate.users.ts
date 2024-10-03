import AtpAgent from '@atproto/api';

import { BlueskyUserDetails } from '../../src/@shared/types/types.bluesky';
import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { handleTwitterSignupMock } from '../__tests__/reusable/mocked.singup';
import { USE_REAL_TWITTER } from '../__tests__/setup';
import { TestServices } from '../__tests__/test.services';
import { authenticateTwitterUser } from './authenticate.twitter';
import { getNanopubProfile } from './nanopub.profile';

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

  if (PLATFORM.Nanopub in credentials) {
    user = await authenticateNanopubForUser(credentials, user);
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
      platformIds: [],
      settings: {
        autopost: {
          [PLATFORM.Nanopub]: {
            value: AutopostOption.MANUAL,
          },
        },
        notificationFreq: NotificationFreq.Daily,
      },
      signupDate: Date.now(),
      accounts: {},
    };
  }

  user.platformIds.push(
    getPrefixedUserId(PLATFORM.Bluesky, credentials.bluesky.id)
  );
  const agent = new AtpAgent({ service: 'https://bsky.social' });
  await agent.login({
    identifier: credentials.bluesky.username,
    password: credentials.bluesky.appPassword,
  });
  if (!agent.session) {
    throw new Error('Failed to login to Bluesky');
  }

  const blueskyUserDetails: BlueskyUserDetails = {
    signupDate: 0,
    user_id: credentials.bluesky.id,
    profile: {
      id: credentials.bluesky.id,
      username: credentials.bluesky.username,
      name: credentials.bluesky.name,
      avatar: 'https://example.com/avatar.jpg', // You may want to update this with a real avatar URL
    },
    read: {
      username: credentials.bluesky.username,
      appPassword: credentials.bluesky.appPassword,
    },
    write: {
      username: credentials.bluesky.username,
      appPassword: credentials.bluesky.appPassword,
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
      platformIds: [],
      settings: {
        autopost: {
          [PLATFORM.Nanopub]: {
            value: AutopostOption.MANUAL,
          },
        },
        notificationFreq: NotificationFreq.Daily,
      },
      signupDate: Date.now(),
      accounts: {},
    };
  }

  user.platformIds.push(
    getPrefixedUserId(PLATFORM.Mastodon, credentials.mastodon.id)
  );

  user.accounts[PLATFORM.Mastodon] = [
    {
      signupDate: 0,
      user_id: credentials.mastodon.id,
      profile: {
        id: credentials.mastodon.id,
        username: credentials.mastodon.username,
        displayName: credentials.mastodon.displayName,
        avatar:
          'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
        mastodonServer: credentials.mastodon.mastodonServer,
      },
      read: {
        accessToken: credentials.mastodon.accessToken,
      },
      write: {
        accessToken: credentials.mastodon.accessToken,
      },
    },
  ];

  return user;
};

const authenticateNanopubForUser = async (
  credentials: TestUserCredentials,
  user?: AppUser
): Promise<AppUser> => {
  const { profile } = await getNanopubProfile(
    credentials.nanopub.ethPrivateKey
  );

  if (!user) {
    user = {
      userId: getPrefixedUserId(PLATFORM.Nanopub, profile.ethAddress),
      platformIds: [],
      settings: {
        autopost: {
          [PLATFORM.Nanopub]: {
            value: AutopostOption.MANUAL,
          },
        },
        notificationFreq: NotificationFreq.Daily,
      },
      signupDate: Date.now(),
      accounts: {},
    };
  }

  user.platformIds.push(
    getPrefixedUserId(PLATFORM.Nanopub, profile.ethAddress)
  );

  user.accounts[PLATFORM.Nanopub] = [
    {
      signupDate: 0,
      user_id: profile.ethAddress,
      profile: {
        ethAddress: profile.ethAddress,
        rsaPublickey: profile.rsaPublickey,
        ethToRsaSignature: profile.ethToRsaSignature,
        introNanopubUri: profile.introNanopubUri,
      },
    },
  ];

  return user;
};
