import { AppUser, HexStr, PLATFORM } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';
import { getPrefixedUserId } from '../../src/users/users.utils';
import { USE_REAL_TWITTER } from '../__tests__/setup';
import { authenticateTwitterUser } from './authenticate.twitter';
import { getNanopubProfile } from './nanopub.profile';
import { getMockedUser } from './users.mock';

export interface TwitterAccountCredentials {
  username: string;
  password: string;
  type: 'read' | 'write';
}

export interface OrcidAccountCredentials {
  username: string;
  password: string;
}

export interface NanopubAccountCredentials {
  ethPrivateKey: HexStr;
}

export interface TestUserCredentials {
  userId: string;
  twitter: TwitterAccountCredentials;
  nanopub: NanopubAccountCredentials;
}

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
  const user0 = USE_REAL_TWITTER
    ? await authenticateTwitterUser(credentials.twitter, services, manager)
    : getMockedUser(credentials);

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
