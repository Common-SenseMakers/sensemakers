import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  TwitterAccountDetails,
  TwitterSigninCredentials,
} from '../../src/@shared/types/types.twitter';
import { AppUser } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { logger } from '../../src/instances/logger';
import { Services } from '../../src/instances/services';

const DEBUG = false;

/**
 * From a set of platform credentials, authenticate the users and
 * return their full profiles
 */
export const authenticateTwitterUser = async (
  testAccount: TwitterSigninCredentials,
  services: Services,
  manager: TransactionManager,
  _userId: string
): Promise<AppUser> => {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error('No bearer token');
  }
  if (DEBUG) logger.debug('authenticateTwitterUser', { testAccount });

  const credentials: TwitterAccountDetails = {
    credentials: {
      read: {
        accessToken: bearerToken,
        refreshToken: bearerToken,
        expiresAtMs: Date.now() + 24 * 60 * 60 * 1000,
        expiresIn: 24 * 60 * 60,
      },
    },
    signupDate: Date.now(),
    user_id: testAccount.id,
  };
  await services.users.repo.setAccountDetails(
    _userId,
    PLATFORM.Twitter,
    credentials,
    manager
  );

  /** read the just created user (will fail if not found) */
  const user = await services.users.repo.getUser(_userId, manager, true);

  return user;
};
