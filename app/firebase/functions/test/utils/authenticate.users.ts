import { TwitterSignupContext } from '../../src/@shared/types/types.twitter';
import { MastodonSignupContext } from '../../src/@shared/types/types.mastodon';
import {
  AppUser,
  NanopubAccountCredentials,
  PLATFORM,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { handleSignupMock } from '../__tests__/reusable/mocked.singup';
import { USE_REAL_TWITTER, USE_REAL_MASTODON } from '../__tests__/setup';
import { TestServices } from '../__tests__/test.services';
import { authenticateTwitterUser } from './authenticate.twitter';
import { authenticateMastodonUser } from './authenticate.mastodon';
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
  platforms: PLATFORM[] = [PLATFORM.Twitter, PLATFORM.Nanopub, PLATFORM.Mastodon]
): Promise<AppUser> => {
  let user: AppUser | undefined;

  if (platforms.includes(PLATFORM.Twitter)) {
    user = await authenticateTwitterForUser(credentials, services, manager);
  }

  if (platforms.includes(PLATFORM.Mastodon)) {
    user = await authenticateMastodonForUser(credentials, services, manager, user);
  }

  if (platforms.includes(PLATFORM.Nanopub)) {
    user = await authenticateNanopubForUser(credentials, user);
  }

  if (!user) {
    throw new Error('No platforms were authenticated');
  }

  return user;
};

const authenticateTwitterForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager
): Promise<AppUser> => {
  if (USE_REAL_TWITTER) {
    return authenticateTwitterUser(credentials.twitter, services, manager);
  } else {
    const twitterSignupContext: TwitterSignupContext =
      await services.users.getSignupContext(
        PLATFORM.Twitter,
        credentials.twitter.id
      );
    const userId = await handleSignupMock(services, {
      ...twitterSignupContext,
      code: 'mocked',
    });

    return services.users.repo.getUser(userId, manager, true);
  }
};

const authenticateMastodonForUser = async (
  credentials: TestUserCredentials,
  services: TestServices,
  manager: TransactionManager,
  user?: AppUser
): Promise<AppUser> => {
  if (USE_REAL_MASTODON) {
    return authenticateMastodonUser(credentials.mastodon, services, manager);
  } else {
    const mastodonSignupContext: MastodonSignupContext =
      await services.users.getSignupContext(
        PLATFORM.Mastodon,
        credentials.mastodon.id
      );
    const userId = await handleSignupMock(services, {
      ...mastodonSignupContext,
      code: 'mocked',
    });

    return services.users.repo.getUser(userId, manager, true);
  }
};

const authenticateNanopubForUser = async (
  credentials: TestUserCredentials,
  user?: AppUser
): Promise<AppUser> => {
  const { profile } = await getNanopubProfile(credentials.nanopub.ethPrivateKey);

  if (!user) {
    user = {
      userId: getPrefixedUserId(PLATFORM.Nanopub, profile.ethAddress),
      platformIds: [],
      settings: {
        autopost: {
          [PLATFORM.Nanopub]: {
            value: 'MANUAL',
          },
        },
        notificationFreq: 'DAILY',
      },
      signupDate: Date.now(),
    };
  }

  user.platformIds.push(
    getPrefixedUserId(PLATFORM.Nanopub, profile.ethAddress)
  );

  user[PLATFORM.Nanopub] = [
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
