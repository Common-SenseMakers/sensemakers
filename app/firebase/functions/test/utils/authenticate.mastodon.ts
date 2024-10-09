import {
  MastodonAccessTokenSignupData,
  MastodonAccountCredentials,
} from '../../src/@shared/types/types.mastodon';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { logger } from '../../src/instances/logger';
import { Services } from '../../src/instances/services';

const DEBUG = false;

/**
 * From a set of platform credentials, authenticate the users and
 * return their full profiles
 */
export const authenticateMastodonUser = async (
  testAccount: MastodonAccountCredentials,
  services: Services,
  manager: TransactionManager,
  _userId?: string
): Promise<AppUser> => {
  if (DEBUG) logger.debug('authenticateMastodonUser', { testAccount });

  const signupData: MastodonAccessTokenSignupData = {
    mastodonServer: testAccount.mastodonServer || 'mastodon.social',
    accessToken: testAccount.accessToken,
    type: 'read',
  };

  /** create users using the Mastodon profiles */
  /** store the user in the DB (build the user profile object and derive the ID) */
  const result = await services.users.handleSignup(
    PLATFORM.Mastodon,
    signupData,
    manager,
    _userId
  );
  if (!result) {
    throw new Error('Unexpected');
  }

  /** read the just created user (will fail if not found) */
  const user = await services.users.repo.getUser(result.userId, manager, true);

  return user;
};
