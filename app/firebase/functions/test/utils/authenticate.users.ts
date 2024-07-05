import {
  AppUser,
  NanopubAccountCredentials,
  PLATFORM,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { handleSignupMock } from '../__tests__/reusable/mocked.singup';
import { USE_REAL_TWITTER } from '../__tests__/setup';
import { authenticateTwitterUser } from './authenticate.twitter';
import { getNanopubProfile } from './nanopub.profile';

export const authenticateTestUsers = async (
  credentials: TestUserCredentials[],
  services: Services,
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
  services: Services,
  manager: TransactionManager
): Promise<AppUser> => {
  const user0 = await (async () => {
    if (USE_REAL_TWITTER) {
      return authenticateTwitterUser(credentials.twitter, services, manager);
    } else {
      const userId = await handleSignupMock(services, {
        signupDate: 1719938012425,
        user_id: credentials.twitter.id,
        profile: {
          id: credentials.twitter.id,
          name: credentials.twitter.username,
          username: credentials.twitter.username,
        },
      });

      return services.users.repo.getUser(userId, manager, true);
    }
  })();

  if (!USE_REAL_TWITTER) {
    // authenticateTwitterUser dont add nanopub credentials, getMockedUser does
    return await authenticateNanopub(user0, credentials.nanopub);
  }

  return user0;
};

const authenticateNanopub = async (
  user: AppUser,
  credentials: NanopubAccountCredentials
): Promise<AppUser> => {
  const { profile } = await getNanopubProfile(credentials.ethPrivateKey);

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
      },
    },
  ];

  return user;
};
