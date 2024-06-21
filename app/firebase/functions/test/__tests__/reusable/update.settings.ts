import { expect } from 'chai';

import { AppUser, UserSettings } from '../../../src/@shared/types/types.user';
import { TestServices } from '../test.services';

export const updateUserSettungs = async (
  services: TestServices,
  newSettings: UserSettings,
  user?: AppUser
) => {
  if (!user) {
    throw new Error('user not created');
  }

  await services.users.updateSettings(user.userId, newSettings);

  const userRead = await services.db.run(async (manager) => {
    if (!user) {
      throw new Error('user not created');
    }

    return services.users.repo.getUser(user.userId, manager, true);
  });

  expect(userRead.settings).to.deep.eq(newSettings);
};
