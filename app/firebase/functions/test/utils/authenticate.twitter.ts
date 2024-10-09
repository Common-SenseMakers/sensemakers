import { IOAuth2RequestTokenResult } from 'twitter-api-v2';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  TwitterGetContextParams,
  TwitterSigninCredentials,
  TwitterSignupData,
} from '../../src/@shared/types/types.twitter';
import { AppUser } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { logger } from '../../src/instances/logger';
import { Services } from '../../src/instances/services';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { runAuthenticateTwitterUser } from './authenticate.twitter.puppetter';

const CALLBACK_URL = 'https://sense-nets.xyz/';

const DEBUG = false;

/**
 * From a set of platform credentials, authenticate the users and
 * return their full profiles
 */
export const authenticateTwitterUser = async (
  testAccount: TwitterSigninCredentials,
  services: Services,
  manager: TransactionManager,
  _userId?: string
): Promise<AppUser> => {
  if (DEBUG) logger.debug('authenticateTwitterUser', { testAccount });

  const twitterService = services.platforms.get<TwitterService>(
    PLATFORM.Twitter
  );

  const signupContext: IOAuth2RequestTokenResult & TwitterGetContextParams =
    await twitterService.getSignupContext(undefined, {
      callback_url: CALLBACK_URL,
      type: testAccount.type,
    });

  const code = await runAuthenticateTwitterUser(
    signupContext.url,
    testAccount.username,
    testAccount.password
  );

  if (DEBUG) logger.debug('authenticatedTwitterUser', { testAccount });

  const signupData: TwitterSignupData = {
    code: code,
    callback_url: signupContext.callback_url,
    codeChallenge: signupContext.codeChallenge,
    codeVerifier: signupContext.codeVerifier,
    state: signupContext.state,
    type: signupContext.type,
    url: signupContext.url,
  };

  /** create users using the Twitter profiles */
  /** store the user in the DB (build the user profile object and derive the ID) */
  const result = await services.users.handleSignup(
    PLATFORM.Twitter,
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
