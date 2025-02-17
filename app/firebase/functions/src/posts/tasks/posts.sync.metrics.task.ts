import { AppPost } from '../../@shared/types/types.posts';
import { Services } from '../../instances/services';
import { splitIntoBatches } from '../../tasks/tasks.support';

export const SYNC_POST_METRICS_TASK = 'syncPostMetrics';
const ALL_CLUSTERS_NAME = 'all';
const MAX_POSTS_TO_BATCH = 10000;
const BATCH_SIZE = 100;
const HOUR_SEC = 60 * 60;
const MAX_PERIOD = 7 * 24 * HOUR_SEC;

export const triggerPostMetricsSync = async (services: Services) => {
  const { postsManager, tasks, clusters } = services;

  const taskMeta = await tasks.repo.getTaskMeta(SYNC_POST_METRICS_TASK);
  const allCluster = clusters.getInstance(ALL_CLUSTERS_NAME);

  const posts = await postsManager.processing.posts.getAllOfQuery(
    {
      fetchParams: {
        sinceId: taskMeta?.lastBatchedPostId,
        expectedAmount: taskMeta ? MAX_POSTS_TO_BATCH : BATCH_SIZE, // if this is the first time running this job, only fetch the last 100
      },
    },
    allCluster
  );

  const batchedPosts = splitIntoBatches(posts, BATCH_SIZE);

  for (const batch of batchedPosts) {
    await tasks.enqueue(
      SYNC_POST_METRICS_TASK,
      {
        posts: batch,
        syncNumber: 1,
      },
      services
    );
  }
  /** if it's the first fetch, the order will be descending, otherwise ascending. */
  const latestPostIndex = taskMeta ? 0 : posts.length - 1;
  await tasks.repo.setTaskMeta(SYNC_POST_METRICS_TASK, {
    lastBatchedPostId: posts[latestPostIndex].id,
  });
};

export const syncPostMetricsTask = async (
  req: {
    data: { posts: AppPost[]; syncNumber: number };
  },
  services: Services
) => {
  await services.db.run(async (manager) => {
    services.postsManager.updatePostMetrics(req.data.posts, manager);
  });
  const nextDispatchDelay = HOUR_SEC * Math.pow(2, req.data.syncNumber); // exponential backoff of task delay, for 1 week
  if (nextDispatchDelay < MAX_PERIOD) {
    await services.tasks.enqueue(
      SYNC_POST_METRICS_TASK,
      { data: { posts: req.data.posts, syncNumber: req.data.syncNumber + 1 } },
      services,
      { scheduleDelaySeconds: nextDispatchDelay }
    );
  }
};
