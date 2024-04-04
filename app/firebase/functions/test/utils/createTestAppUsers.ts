import { AppUser, PLATFORM, UserDetailsBase } from '../../src/@shared/types';
import { getPrefixedUserId } from '../../src/users/users.utils';
import {
  NUM_TWITTER_USERS,
  testTwitterAccountTokens,
} from '../__tests__/setup';
import { services } from '../__tests__/test.services';
import { TwitterAccountCredentials } from './authenticateTwitterUsers';

/** store on the database some users */
export const createTestAppUsers = async (
  users: UserDetailsBase[]
): Promise<AppUser[]> => {
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
