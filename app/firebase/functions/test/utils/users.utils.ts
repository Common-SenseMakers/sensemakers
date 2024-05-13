import { AppUser } from '../../src/@shared/types/types';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';

/**
 * from a testUsers map, store in the DB the profiles of those
 * matching the userIds provided, or all if none provided
 */
export const createUsers = async (
  services: Services,
  testUsers: AppUser[],
  manager: TransactionManager
): Promise<AppUser[]> => {
  /** if no specific users specified, create them all */
  const users = await Promise.all(
    Array.from(testUsers.values()).map(async (user) => {
      const userId = await services.users.repo.createUser(
        user.userId,
        user,
        manager
      );
      return services.users.repo.getUser(userId, manager, true);
    })
  );

  return users;
};
