import { expect } from 'chai';
import { logger } from 'firebase-functions';

import { TwitterUserProfile } from '../../../src/@shared/types/types.twitter';
import { PLATFORM } from '../../../src/@shared/types/types.user';
import {
  TWITTER_NAME_MOCKS,
  TWITTER_USERNAME_MOCKS,
  TWITTER_USER_ID_MOCKS,
} from '../../../src/platforms/twitter/mock/twitter.service.mock';
import { getPrefixedUserId } from '../../../src/users/users.utils';
import { TestServices } from '../test.services';

const TWITTER_PROFILE: TwitterUserProfile = {
  id: TWITTER_USER_ID_MOCKS,
  name: TWITTER_NAME_MOCKS,
  username: TWITTER_USERNAME_MOCKS,
};

export const userId = getPrefixedUserId(
  PLATFORM.Twitter,
  TWITTER_USER_ID_MOCKS
);

export const handleSignupMock = async (services: TestServices) => {
  if (!userId) {
    throw new Error('unexpected');
  }

  await services.db.run(async (manager) => {
    logger.debug(`handleSignup`, { user_id: TWITTER_USER_ID_MOCKS });

    const result = await services.users.handleSignup(
      PLATFORM.Twitter,
      { user_id: TWITTER_USER_ID_MOCKS, profile: TWITTER_PROFILE },
      manager
    );

    logger.debug(`handleSignup - result `, { result });

    expect(result).to.not.be.undefined;

    if (!result) {
      throw new Error('unexpected');
    }

    expect(result.userId).to.eq(userId);
    expect(result.ourAccessToken).to.not.be.undefined;
  });

  await services.db.run(async (manager) => {
    const userRead = await services.users.repo.getUser(userId, manager, true);

    expect(userRead).to.not.be.undefined;

    const userReadProfile = await services.users.repo.getByPlatformUsername(
      PLATFORM.Twitter,
      'username',
      TWITTER_PROFILE.username,
      manager
    );

    expect(userReadProfile).to.not.be.undefined;
  });
};
