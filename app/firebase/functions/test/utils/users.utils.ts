import {
  AccountProfile,
  AccountProfileCreate,
} from '../../src/@shared/types/types.profiles';
import { AppUser } from '../../src/@shared/types/types.user';
import { TransactionManager } from '../../src/db/transaction.manager';
import { Services } from '../../src/instances/services';
import { TestProfileData, TestUserData } from '../__tests__/setup';

export const createUsers = async (
  services: Services,
  testUsers: TestUserData[],
  manager: TransactionManager
): Promise<AppUser[]> => {
  /** if no specific users specified, create them all */
  const users = await Promise.all(
    testUsers.map(async (userData) => {
      /** create the user */
      const userId = await services.users.repo.createUser(
        userData.user.userId,
        userData.user,
        manager
      );

      /** create the profiles */
      userData.profiles.map(async (profile: AccountProfileCreate) => {
        /** create profile and link it to the user */
        /** create the profile when addint that account */
        const profileCreate: AccountProfileCreate = {
          ...profile,
          userId,
        };

        const createdProfile = services.profiles.createProfile(
          profileCreate,
          manager
        );

        await Promise.all(
          userData.clustersIds.map((clusterId) => {
            return services.profiles.repo.addCluster(
              createdProfile.id,
              clusterId,
              manager
            );
          })
        );
      });

      return services.users.repo.getUser(userId, manager, true);
    })
  );

  /** create profiles too */
  return users;
};

export const createProfiles = async (
  services: Services,
  testProfiles: TestProfileData[],
  manager: TransactionManager
): Promise<AccountProfile[]> => {
  return Promise.all(
    testProfiles.map(async (profileData) => {
      const clustersIds = profileData.clustersIds;

      const createdProfile = services.profiles.createProfile(
        profileData.profile,
        manager
      );

      await Promise.all(
        clustersIds.map((clusterId) => {
          return services.profiles.repo.addCluster(
            createdProfile.id,
            clusterId,
            manager
          );
        })
      );

      return createdProfile;
    })
  );
};
