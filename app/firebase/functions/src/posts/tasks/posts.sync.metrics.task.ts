import { PUBLISHABLE_PLATFORM } from '../../@shared/types/types.platforms';
import { AppPost } from '../../@shared/types/types.posts';
import { Services } from '../../instances/services';
import { JOBS } from '../../jobs/types.jobs';
import { splitIntoBatches } from '../../tasks/tasks.support';
import {
  PLATFORM_TASKS,
  SyncPlatformPostMetricsRequest,
} from '../../tasks/types.tasks';

const ALL_CLUSTERS_NAME = 'all';
const MAX_POSTS_TO_BATCH = 10000;
const BATCH_SIZE = 100;
const HOUR_SEC = 60 * 60;
const MAX_PERIOD = 7 * 24 * HOUR_SEC;

export const triggerPostMetricsSync = async (services: Services) => {
  const { postsManager, tasks, clusters, jobs } = services;

  const jobMeta = await jobs.repo.getJobMeta(JOBS.SYNC_POST_METRICS);
  const allCluster = clusters.getInstance(ALL_CLUSTERS_NAME);

  const posts = await postsManager.processing.posts.getAllOfQuery(
    {
      fetchParams: {
        sinceId: jobMeta?.lastBatchedPostId,
        expectedAmount: jobMeta ? MAX_POSTS_TO_BATCH : BATCH_SIZE, // if this is the first time running this job, only fetch the last 100
      },
    },
    allCluster
  );

  /** split posts into platforms, since each platform should be handled differently */
  const postsByPlatform: Map<PUBLISHABLE_PLATFORM, AppPost[]> = new Map();

  posts.forEach((post) => {
    const platform = post.origin as PUBLISHABLE_PLATFORM;
    if (!postsByPlatform.has(platform)) {
      postsByPlatform.set(platform, []);
    }
    postsByPlatform.get(platform)?.push(post);
  });

  for (const [platform, posts] of postsByPlatform) {
    const batchedPosts = splitIntoBatches(posts, BATCH_SIZE);

    for (const batch of batchedPosts) {
      await tasks.enqueue(
        PLATFORM_TASKS.SYNC_POST_METRICS_TASK[platform],
        {
          posts: batch,
          platformId: platform,
          syncNumber: 1,
        },
        services
      );
    }
  }

  /** if it's the first fetch, the order will be descending, otherwise ascending. */
  const latestPostIndex = jobMeta ? 0 : posts.length - 1;
  await jobs.repo.setJobMeta(JOBS.SYNC_POST_METRICS, {
    lastBatchedPostId: posts[latestPostIndex].id,
  });
};

export const syncPostMetricsTask = async (
  req: { data: SyncPlatformPostMetricsRequest },
  services: Services
) => {
  await services.db.run(async (manager) => {
    services.postsManager.updatePostMetrics(req.data.posts, manager);
  });
  const nextDispatchDelay = HOUR_SEC * Math.pow(2, req.data.syncNumber); // exponential backoff of task delay, for 1 week
  if (nextDispatchDelay < MAX_PERIOD) {
    await services.tasks.enqueue(
      PLATFORM_TASKS.SYNC_POST_METRICS_TASK[req.data.platformId],
      { ...req.data, syncNumber: req.data.syncNumber + 1 },
      services,
      { scheduleDelaySeconds: nextDispatchDelay }
    );
  }
};
