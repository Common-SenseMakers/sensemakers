import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../../@shared/types/types.platforms';
import { AppPost } from '../../@shared/types/types.posts';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';
import { JOBS } from '../../jobs/types.jobs';
import { splitIntoBatches } from '../../tasks/tasks.support';
import {
  PLATFORM_TASKS,
  SyncPlatformPostMetricsRequest,
} from '../../tasks/types.tasks';

const MAX_POSTS_TO_BATCH = 10000;
const BATCH_SIZE = 100;
const DEBUG = true;
const DEBUG_PREFIX = 'SYNC_METRICS';

export const triggerPostMetricsSync = async (services: Services) => {
  if (DEBUG)
    logger.debug('triggerPostMetricsSync started', undefined, DEBUG_PREFIX);
  const { postsManager, tasks, clusters, jobs } = services;

  const jobMeta = await jobs.repo.getJobMeta(JOBS.SYNC_POST_METRICS);
  const allCluster = clusters.getInstance(undefined);

  const posts = await postsManager.processing.posts.getAllOfQuery(
    {
      fetchParams: {
        sinceId: jobMeta?.lastBatchedPostId,
        expectedAmount: jobMeta ? MAX_POSTS_TO_BATCH : BATCH_SIZE, // if this is the first time running this job, only fetch the last 100
      },
    },
    allCluster
  );

  /** if there are no posts, don't enqueue any tasks or update the job meta */
  if (posts.length === 0) {
    if (DEBUG) logger.debug('No posts found to sync', undefined, DEBUG_PREFIX);
    return;
  }

  if (DEBUG)
    logger.debug(
      `Found ${posts.length} posts to sync`,
      undefined,
      DEBUG_PREFIX
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
          dispatchNumber: 1,
        },
        services
      );
    }
  }

  /** posts are always sorted in descending order in getAllOfQuery */
  const latestPostIndex = 0;
  await jobs.repo.setJobMeta(JOBS.SYNC_POST_METRICS, {
    lastBatchedPostId: posts[latestPostIndex].id,
  });
};

export const syncPostMetricsTask = async (
  req: { data: SyncPlatformPostMetricsRequest },
  services: Services
) => {
  if (DEBUG) {
    logger.debug(
      `syncPostMetricsTask for platform ${req.data.platformId}`,
      {
        postsCount: req.data.posts.length,
        dispatchNumber: req.data.dispatchNumber,
      },
      DEBUG_PREFIX
    );
  }
  await services.db.run(async (manager) => {
    services.postsManager.updatePostMetrics(req.data.posts, manager);
  });
  const nextDispatchDelay = calculateDispatchDelay(
    req.data.platformId,
    req.data.dispatchNumber
  );
  if (nextDispatchDelay) {
    if (DEBUG) {
      logger.debug(
        `Scheduling next metrics sync`,
        {
          platform: req.data.platformId,
          delay: nextDispatchDelay,
          nextDispatch: req.data.dispatchNumber + 1,
        },
        DEBUG_PREFIX
      );
    }
    await services.tasks.enqueue(
      PLATFORM_TASKS.SYNC_POST_METRICS_TASK[req.data.platformId],
      { ...req.data, dispatchNumber: req.data.dispatchNumber + 1 },
      services,
      { scheduleDelaySeconds: nextDispatchDelay }
    );
  } else if (DEBUG) {
    logger.debug(
      `No more dispatches scheduled`,
      {
        platform: req.data.platformId,
        dispatchNumber: req.data.dispatchNumber,
      },
      DEBUG_PREFIX
    );
  }
};

const calculateDispatchDelay = (
  platformId: PUBLISHABLE_PLATFORM,
  dispatchNumber: number
) => {
  /** first hour */
  if (dispatchNumber < 13) {
    return 60 * 5; // 5 minutes
  }

  /** first 24 hours */
  if (dispatchNumber < 79) {
    return 60 * 20; // 20 minutes
  }

  /** beyond one day, don't fetch tweets */
  if (platformId === PLATFORM.Twitter) {
    return undefined;
  }

  if (dispatchNumber < 110) {
    return 60 * 60 * 24; // 1 day
  }

  /** if beyond 1 month, stop fetching */
  return undefined;
};
