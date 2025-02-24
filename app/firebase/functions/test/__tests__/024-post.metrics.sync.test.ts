import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { GenericThread } from '../../src/@shared/types/types.posts';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { JOBS } from '../../src/jobs/types.jobs';
import { triggerPostMetricsSync } from '../../src/posts/tasks/posts.sync.metrics.task';
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
  it('updates the metrics of posts and properly update related job meta', async () => {
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
      posts
        .filter((post) => post.post.generic.thread[0].content)
        .map((post) => {
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
      return await services.postsManager.updatePostMetrics(appPosts, manager);
    });
    const updatedPosts = await services.postsManager.getOfUser({
      userId: user.userId,
      origins: [PLATFORM.Bluesky],
    });
    updatedPosts.forEach((p) => {
      expect(p.generic.engagementMetrics).to.not.deep.equal({
        likes: 100,
        reposts: 100,
        replies: 100,
      });
    });

    const jobsMeta = await services.jobs.repo.getJobMeta(
      JOBS.SYNC_POST_METRICS
    );
    expect(jobsMeta).to.be.undefined;

    await triggerPostMetricsSync(services);

    const updatedJobsMeta = await services.jobs.repo.getJobMeta(
      JOBS.SYNC_POST_METRICS
    );
    expect(updatedJobsMeta?.lastBatchedPostId).to.be.equal(updatedPosts[0].id);

    await services.jobs.repo.setJobMeta(JOBS.SYNC_POST_METRICS, {
      lastBatchedPostId: updatedPosts[4].id,
    });
    await triggerPostMetricsSync(services);

    const lastJobsMeta = await services.jobs.repo.getJobMeta(
      JOBS.SYNC_POST_METRICS
    );
    expect(lastJobsMeta?.lastBatchedPostId).to.be.equal(updatedPosts[0].id);
  });
});
