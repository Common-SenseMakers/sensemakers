import { AppUser, PLATFORM } from '../../src/@shared/types';
import { getPrefixedUserId } from '../../src/users/users.utils';
import {
  NUM_TWITTER_USERS,
  testTwitterAccountTokens,
} from '../__tests__/setup';
import { services } from '../__tests__/test.services';
import { TwitterAccountCredentials } from './authenticateTwitterUsers';

const mandatory = ['TEST_USER_TWITTER_ACCOUNTS'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const TWITTER_ACCOUNTS: TwitterAccountCredentials[] = JSON.parse(
  process.env.TEST_USER_TWITTER_ACCOUNTS as string
);

export const createTestAppUsers = async (): Promise<AppUser[]> => {
  if (!TWITTER_ACCOUNTS) {
    throw new Error('test acccounts undefined');
  }
  if (TWITTER_ACCOUNTS.length < NUM_TWITTER_USERS) {
    throw new Error('not enough twitter account credentials provided');
  }
  /** store some real twitter users in the DB */
  const users: AppUser[] = TWITTER_ACCOUNTS.splice(0, NUM_TWITTER_USERS).map(
    (twitterAccount): AppUser => {
      const twitter = testTwitterAccountTokens.get(twitterAccount.username);
      if (!twitter) {
        throw new Error('Unexpected');
      }
      const user_id = twitter.user_id;
      const userId = getPrefixedUserId(PLATFORM.Twitter, user_id);
      return {
        userId,
        platformIds: [userId],
        twitter: [twitter],
      };
    }
  );

  await Promise.all(
    users.map((user) => services.users.repo.createUser(user.userId, user))
  );

  /** wait for just a second */
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  return users;
};
