import { AccountProfileCreate } from '../../src/@shared/types/types.profiles';
import { AppUser } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';
import { UserAndProfiles } from '../__tests__/setup';

export const createUsers = async (
  services: Services,
  testUsers: UserAndProfiles[],
  manager: TransactionManager
): Promise<AppUser[]> => {
  /** if no specific users specified, create them all */
  const users = await Promise.all(
    testUsers.map(async (userAndProfiles) => {
      /** create the user */
      const userId = await services.users.repo.createUser(
        userAndProfiles.user.userId,
        userAndProfiles.user,
        manager
      );

      /** create the profiles */
      userAndProfiles.profiles.map(async (profile: AccountProfileCreate) => {
        /** create profile and link it to the user */
        /** create the profile when addint that account */
        const profileCreate: AccountProfileCreate = {
          ...profile,
          userId,
        };

        services.users.createProfile(profileCreate, manager);
      });

      return services.users.repo.getUser(userId, manager, true);
    })
  );

  /** create profiles too */
  return users;
};
