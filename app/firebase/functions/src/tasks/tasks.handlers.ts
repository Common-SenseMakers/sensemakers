import {
  TaskQueueOptions,
  onTaskDispatched,
} from 'firebase-functions/v2/tasks';

import { PLATFORM } from '../@shared/types/types.platforms';
import { envDeploy } from '../config/typedenv.deploy';
import { firestore, secrets } from '../firestore.config';
import { createServices } from '../instances/services';
import { fetchPlatformAccountTask } from '../platforms/platforms.tasks';
import { FETCH_TASK_DISPATCH_RATES } from '../platforms/platforms.tasks.config';
import { autofetchUserPosts } from '../posts/tasks/posts.autofetch.task';
import { parsePostTask } from '../posts/tasks/posts.parse.task';
import { replaceUserTask } from '../posts/tasks/replace.user.task';
import { getConfig } from '../services.config';

const deployConfigTasks: TaskQueueOptions = {
  timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
  memory: envDeploy.CONFIG_MEMORY_TASKS,
  minInstances: envDeploy.CONFIG_MININSTANCE,
  secrets,
};
/**
 * Open Router rate limits: https://openrouter.ai/docs/limits
 *
 */
export const parsePostTaskHandler = onTaskDispatched(
  {
    ...deployConfigTasks,
    retryConfig: {
      maxAttempts: 5,
      minBackoffSeconds: 5,
      maxDoublings: 4,
    },
    maxInstances: 10,
    concurrency: 100,
    rateLimits: {
      maxConcurrentDispatches: 1000,
      maxDispatchesPerSecond: 150,
    },
  },
  (req) => parsePostTask(req, createServices(firestore, getConfig()))
);

export const autoFetchPostsTaskHandler = onTaskDispatched(
  {
    ...deployConfigTasks,
    retryConfig: {
      maxAttempts: 1,
    },
  },
  async (req) => {
    void (await autofetchUserPosts(
      req,
      createServices(firestore, getConfig())
    ));
  }
);

/**
 * GET_2_users_param_tweets: https://developer.x.com/en/docs/x-api/rate-limits#v2-limits-basic
 * 10 requests / 15 min per app
 * 5 requests / 15 min per user
 */
export const fetchTwitterAccountTaskHandler = onTaskDispatched(
  {
    ...deployConfigTasks,
    secrets,
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60 * 5,
    },
    rateLimits: {
      maxConcurrentDispatches: 1, // 1 task dispatched at a time
      maxDispatchesPerSecond: FETCH_TASK_DISPATCH_RATES[PLATFORM.Twitter],
    },
  },
  (req) => fetchPlatformAccountTask(req, createServices(firestore, getConfig()))
);

/**
 * rate limits: https://docs-p.joinmastodon.org/api/rate-limits/
 * all endpoints: 300 requests / 5 min per account
 */
export const fetchMastodonAccountTaskHandler = onTaskDispatched(
  {
    ...deployConfigTasks,
    secrets,
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 1000,
      maxDispatchesPerSecond: FETCH_TASK_DISPATCH_RATES[PLATFORM.Mastodon],
    },
  },
  (req) => fetchPlatformAccountTask(req, createServices(firestore, getConfig()))
);

/**
 * rate limit: https://docs.bsky.app/docs/advanced-guides/rate-limits
 * all endpoits by IP: 3000 requests / 5 minutes
 */
export const fetchBlueskyAccountTaskHandler = onTaskDispatched(
  {
    ...deployConfigTasks,
    secrets,
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 1000,
      maxDispatchesPerSecond: FETCH_TASK_DISPATCH_RATES[PLATFORM.Bluesky],
    },
  },
  (req) => fetchPlatformAccountTask(req, createServices(firestore, getConfig()))
);

export const replaceUserTaskHandler = onTaskDispatched(
  { ...deployConfigTasks, secrets },
  (req) => replaceUserTask(req, createServices(firestore, getConfig()))
);
