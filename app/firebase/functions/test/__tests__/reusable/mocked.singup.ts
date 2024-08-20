import { expect } from 'chai';
import { logger } from 'firebase-functions';

import { TwitterSignupData } from '../../../src/@shared/types/types.twitter';
import { PLATFORM } from '../../../src/@shared/types/types.user';
import { UsersHelper } from '../../../src/users/users.helper';
import { getPrefixedUserId } from '../../../src/users/users.utils';
import { TestServices } from '../test.services';

export const handleSignupMock = async (
  services: TestServices,
  signupData: TwitterSignupData
) => {
  const userId = await services.db.run(async (manager) => {
    logger.debug(`handleSignup`, { user_id: signupData.codeChallenge });

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
      getPrefixedUserId(PLATFORM.Twitter, signupData.codeChallenge)
    );
    expect(result.ourAccessToken).to.not.be.undefined;

    return result.userId;
  });

  /** check it was correctly created */
  await services.db.run(async (manager) => {
    const userRead = await services.users.repo.getUser(userId, manager, true);

    expect(userRead).to.not.be.undefined;

    const account = UsersHelper.getAccount(userRead, PLATFORM.Twitter);
    if (!account?.profile) {
      throw new Error('unexpected');
    }

    const userReadProfile = await services.users.repo.getByPlatformUsername(
      PLATFORM.Twitter,
      'username',
      account.profile.username,
      manager
    );

    expect(userReadProfile).to.not.be.undefined;

    return userRead.userId;
  });

  return userId;
};
