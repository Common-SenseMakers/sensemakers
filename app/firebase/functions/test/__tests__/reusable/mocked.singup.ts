import { expect } from 'chai';
import { logger } from 'firebase-functions';

import { PLATFORM } from '../../../src/@shared/types/types.platforms';
import { TwitterSignupData } from '../../../src/@shared/types/types.twitter';
import { UsersHelper } from '../../../src/users/users.helper';
import { getPrefixedUserId } from '../../../src/users/users.utils';
import { TestServices } from '../test.services';

export const handleTwitterSignupMock = async (
  services: TestServices,
  signupData: TwitterSignupData,
  _userId?: string
) => {
  const userId = await services.db.run(async (manager) => {
    logger.debug(`handleSignup`, { user_id: signupData.codeChallenge });

    const result = await services.users.handleSignup(
      PLATFORM.Twitter,
      signupData,
      manager,
      _userId
    );

    logger.debug(`handleSignup - result `, { result });

    expect(result).to.not.be.undefined;

    if (!result) {
      throw new Error('unexpected');
    }

    expect(result.userId).to.eq(
      getPrefixedUserId(PLATFORM.Twitter, signupData.codeChallenge)
    );
    expect(result.ourAccessToken).to.not.be.undefined;

    return result.userId;
  });

  /** check it was correctly created */
  await services.db.run(async (manager) => {
    const user = await services.users.repo.getUser(userId, manager, true);

    const userRead = await services.db.run((manager) => {
      if (!user) {
        throw new Error('user not created');
      }
      return services.users.getUserWithProfiles(user.userId, manager);
    });
    expect(userRead).to.not.be.undefined;

    const profile = UsersHelper.getProfile(userRead, PLATFORM.Twitter);
    expect(profile).to.not.be.undefined;

    return userRead.userId;
  });

  return userId;
};
