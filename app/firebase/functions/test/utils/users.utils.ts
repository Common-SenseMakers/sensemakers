import { AccountProfileCreate } from '../../src/@shared/types/types.profiles';
import { AppUser } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';

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
      
      const userCreated = await services.users.repo.getUser(userId, manager, true);

      /** create profile and link it to the user */
        /** create the profile when addint that account */
        const profileCreate: AccountProfileCreate = {
          ...profile,
          userId,
          platformId: platform,
        };

        this.profiles.create(profileCreate, manager);
        
    })
  );

  return users;
};
