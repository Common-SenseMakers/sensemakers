import { AppUser } from '../../src/@shared/types/types';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';
import { testUsers } from '../__tests__/setup';

/**
 * from a testUsers map, store in the DB the profiles of those
 * matching the userIds provided, or all if none provided
 */
export const createTestAppUsers = async (
  services: Services,
  manager: TransactionManager,
  userIds?: string[]
): Promise<AppUser[]> => {
  /** if no specific users specified, create them all */
  if (!userIds) {
    userIds = Array.from(testUsers.keys());
  }
  const users: AppUser[] = userIds.map((userId): AppUser => {
    const appUser = testUsers.get(userId);
    if (!appUser) {
      throw new Error('Unexpected');
    }
    return appUser;
  });

  await Promise.all(
    users.map((user) => {
      return services.users.repo.createUser(user.userId, user, manager);
    })
  );

  /** wait for just a second */
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  return users;
};
