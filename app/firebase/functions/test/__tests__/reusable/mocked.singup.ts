import { expect } from 'chai';
import { logger } from 'firebase-functions';

import { TwitterSignupData } from '../../../src/@shared/types/types.twitter';
import { MastodonSignupData } from '../../../src/@shared/types/types.mastodon';
import { PLATFORM } from '../../../src/@shared/types/types.user';
import { UsersHelper } from '../../../src/users/users.helper';
import { getPrefixedUserId } from '../../../src/users/users.utils';
import { TestServices } from '../test.services';

export const handleSignupMock = async (
  services: TestServices,
  signupData: TwitterSignupData | MastodonSignupData
) => {
  const platform = 'codeChallenge' in signupData ? PLATFORM.Twitter : PLATFORM.Mastodon;
  const userId = await services.db.run(async (manager) => {
    logger.debug(`handleSignup`, { user_id: 'codeChallenge' in signupData ? signupData.codeChallenge : signupData.code });

    const result = await services.users.handleSignup(
      platform,
      signupData,
      manager
    );

    logger.debug(`handleSignup - result `, { result });

    expect(result).to.not.be.undefined;

    if (!result) {
      throw new Error('unexpected');
    }

    expect(result.userId).to.eq(
      getPrefixedUserId(platform, 'codeChallenge' in signupData ? signupData.codeChallenge : signupData.code)
    );
    expect(result.ourAccessToken).to.not.be.undefined;

    return result.userId;
  });

  /** check it was correctly created */
  await services.db.run(async (manager) => {
    const userRead = await services.users.repo.getUser(userId, manager, true);

    expect(userRead).to.not.be.undefined;

    const account = UsersHelper.getAccount(userRead, platform);
    if (!account?.profile) {
      throw new Error('unexpected');
    }

    const userReadProfile = await services.users.repo.getByPlatformUsername(
      platform,
      'username',
      account.profile.username,
      manager
    );

    expect(userReadProfile).to.not.be.undefined;

    return userRead.userId;
  });

  return userId;
};
