import { Services } from '../instances/services';
import { splitIntoBatches } from '../tasks/tasks.support';

export const SYNC_POST_METRICS_TASK = 'syncPostMetrics';
const ALL_CLUSTERS_NAME = 'all';
const MAX_POSTS_TO_BATCH = 10000;
const BATCH_SIZE = 100;

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
