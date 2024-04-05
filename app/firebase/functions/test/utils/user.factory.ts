import { AppUser } from '../../src/@shared/types';
import { testUsers } from '../__tests__/setup';
import { services } from '../__tests__/test.services';

export const createTestAppUsers = async (
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
      const { userId, ...createAppUser } = user;
      return services.users.repo.createUser(user.userId, createAppUser);
    })
  );

  /** wait for just a second */
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  return users;
};
