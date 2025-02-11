import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  TwitterSigninCredentials,
  TwitterSignupData,
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

  const twitterSignupData: TwitterSignupData = {
    url: 'callback_url',
    code: '1234',
    codeVerifier: '1234',
    state: '1234',
    codeChallenge: testAccount.id,
    callback_url: 'callback_url',
    type: 'read',
  };
  await services.users.handleSignup(
    PLATFORM.Twitter,
    twitterSignupData,
    manager,
    _userId
  );

  /** read the just created user (will fail if not found) */
  const user = await services.users.repo.getUser(_userId, manager, true);

  return user;
};
