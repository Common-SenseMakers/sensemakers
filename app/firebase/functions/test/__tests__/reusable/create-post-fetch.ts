import { expect } from 'chai';
import { logger } from 'firebase-functions';
import { user } from 'firebase-functions/v1/auth';

import { AppUser, PLATFORM } from '../../../src/@shared/types/types.user';
import { TWITTER_USER_ID_MOCKS } from '../../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../../src/platforms/twitter/twitter.service';
import { UsersHelper } from '../../../src/users/users.helper';
import { fetchPostsInTests } from '../../utils/posts.utils';
import { createUsers } from '../../utils/users.utils';
import { USE_REAL_TWITTER, testUsers } from '../setup';
import { TestServices } from '../test.services';

export const _01_createAndFetchUsers = async (
  services: TestServices,
  debug: { DEBUG: boolean; DEBUG_PREFIX: string }
) => {
  let user: AppUser | undefined;

  const { DEBUG, DEBUG_PREFIX } = debug;

  await services.db.run(async (manager) => {
    const users = await createUsers(
      services,
      Array.from(testUsers.values()),
      manager
    );
    if (DEBUG)
      logger.debug(`users crated ${users.length}`, { users }, DEBUG_PREFIX);

    user = users.find(
      (u) =>
        UsersHelper.getAccount(u, PLATFORM.Twitter, TWITTER_USER_ID_MOCKS) !==
        undefined
    );
    if (DEBUG)
      logger.debug(`test user ${user?.userId}`, { user }, DEBUG_PREFIX);
  });

  /**
   * fetch once to get the posts once and set the fetchedDetails of
   * the account
   */

  if (!user) throw new Error('user not created');
  if (DEBUG) logger.debug(` ${user?.userId}`, { user }, DEBUG_PREFIX);

  /** fetch will store the posts in the DB */
  await fetchPostsInTests(
    user.userId,
    { expectedAmount: 10 },
    services.postsManager
  );

  return user;
};

export const _02_PublishTweet = async (
  services: TestServices,
  user?: AppUser
) => {
  await services.db.run(async (manager) => {
    if (!user) {
      throw new Error('user not created');
    }

    const accounts = user[PLATFORM.Twitter];
    if (!accounts) {
      throw new Error('Unexpected');
    }
    const account = accounts[0];
    if (!account) {
      throw new Error('Unexpected');
    }

    const TEST_CONTENT = `This is a test post ${USE_REAL_TWITTER ? Date.now() : ''}`;

    const thread = await services.platforms
      .get<TwitterService>(PLATFORM.Twitter)
      .publish(
        {
          draft: { text: TEST_CONTENT },
          userDetails: account,
        },
        manager
      );

    expect(thread).to.not.be.undefined;

    if (USE_REAL_TWITTER) {
      await new Promise<void>((resolve) => setTimeout(resolve, 6 * 1000));
    }

    return thread;
  });
};

export const _03_fetchAfterPublish = async (
  services: TestServices,
  userId?: string
) => {
  if (!userId) {
    throw new Error('user not created');
  }

  /**
   * fetch user posts. This time should return only the
   * newly published post
   */
  await fetchPostsInTests(
    userId,
    { expectedAmount: 10 },
    services.postsManager
  );

  /** read user post */
  const postsRead = await services.postsManager.getOfUser(userId);

  expect(postsRead).to.not.be.undefined;

  const postRead = postsRead[0];
  expect(postRead).to.not.be.undefined;
  expect(postRead.mirrors).to.have.length(2);

  expect(postRead.semantics).to.not.be.undefined;
  expect(postRead.originalParsed).to.not.be.undefined;

  const tweetRead = postRead.mirrors.find(
    (m) => m.platformId === PLATFORM.Twitter
  );

  if (!tweetRead) {
    throw new Error('tweetRead not created');
  }

  if (!user) {
    throw new Error('user not created');
  }

  expect(postRead).to.not.be.undefined;
};
