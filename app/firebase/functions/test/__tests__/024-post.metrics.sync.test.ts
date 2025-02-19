import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { GenericThread } from '../../src/@shared/types/types.posts';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe.only('Post Metrics Syncing', () => {
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    bluesky: USE_REAL_BLUESKY
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    mastodon: USE_REAL_MASTODON
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    await services.db.run(async (manager) => {
      const users = await createUsers(
        services,
        Array.from(testUsers.values()),
        manager
      );
      const testUser = testCredentials[0];

      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Bluesky, testUser.bluesky.id) !==
          undefined
      );
    });
  });
  it('updates the metrics of posts', async () => {
    if (!user) {
      throw new Error('User not found');
    }
    const posts = await services.postsManager.fetchUser({
      userId: user.userId,
      params: {
        expectedAmount: 5,
      },
      platformIds: [PLATFORM.Bluesky],
    });

    await Promise.all(
      posts.map((post) => {
        return services.db.run(async (manager) => {
          const newGeneric: GenericThread = {
            ...post.post.generic,
            engagementMetrics: {
              likes: 100,
              reposts: 100,
              replies: 100,
            },
          };
          return await services.postsManager.updatePost(
            post.post.id,
            { generic: newGeneric },
            manager
          );
        });
      })
    );

    const appPosts = posts.map((p) => p.post);
    await services.db.run(async (manager) => {
      return services.postsManager.updatePostMetrics(appPosts, manager);
    });
    const updatedPosts = await services.postsManager.getOfUser({
      userId: user.userId,
    });
    updatedPosts.forEach((p) => {
      expect(p.generic.engagementMetrics).to.not.equal({
        likes: 100,
        reposts: 100,
        replies: 100,
      });
    });
  });
});
