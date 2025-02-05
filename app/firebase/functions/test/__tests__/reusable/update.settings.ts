import { expect } from 'chai';

import {
  AppUser,
  UserSettings,
  UserSettingsUpdate,
} from '../../../src/@shared/types/types.user';
import { TestServices } from '../test.services';

export const updateUserSettings = async (
  services: TestServices,
  newSettings: UserSettingsUpdate,
  user?: AppUser
) => {
  if (!user) {
    throw new Error('user not created');
  }

  const userRead = await services.db.run(async (manager) => {
    if (!user) {
      throw new Error('user not created');
    }
    await services.users.updateSettings(user.userId, newSettings, manager);

    return services.users.repo.getUser(user.userId, manager, true);
  });

  (Object.keys(newSettings) as (keyof UserSettings)[]).forEach((key) => {
    expect(userRead.settings[key]).to.deep.eq(newSettings[key]);
  });
};
