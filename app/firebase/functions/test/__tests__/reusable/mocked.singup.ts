import { expect } from 'chai';
import { logger } from 'firebase-functions';

import { TwitterUserDetails } from '../../../src/@shared/types/types.twitter';
import { PLATFORM } from '../../../src/@shared/types/types.user';
import { getPrefixedUserId } from '../../../src/users/users.utils';
import { TestServices } from '../test.services';

export const handleSignupMock = async (
  services: TestServices,
  signupData: TwitterUserDetails
) => {
  const userId = await services.db.run(async (manager) => {
    logger.debug(`handleSignup`, { user_id: signupData.user_id });

    const result = await services.users.handleSignup(
      PLATFORM.Twitter,
      signupData,
      manager
    );

    logger.debug(`handleSignup - result `, { result });

    expect(result).to.not.be.undefined;

    if (!result) {
      throw new Error('unexpected');
    }

    expect(result.userId).to.eq(
      getPrefixedUserId(PLATFORM.Twitter, signupData.user_id)
    );
    expect(result.ourAccessToken).to.not.be.undefined;

    return result.userId;
  });

  /** check it was correctly created */
  await services.db.run(async (manager) => {
    const userRead = await services.users.repo.getUser(userId, manager, true);

    expect(userRead).to.not.be.undefined;

    if (!signupData.profile) {
      throw new Error('unexpected');
    }

    const userReadProfile = await services.users.repo.getByPlatformUsername(
      PLATFORM.Twitter,
      'username',
      signupData.profile.username,
      manager
    );

    expect(userReadProfile).to.not.be.undefined;

    return userRead.userId;
  });

  return userId;
};
