import express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { SecretParam } from 'firebase-functions/lib/params/types';
import {
  FirestoreEvent,
  QueryDocumentSnapshot,
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  TaskQueueOptions,
  onTaskDispatched,
} from 'firebase-functions/v2/tasks';

import { ActivityEventBase } from './@shared/types/types.activity';
import { PlatformPost } from './@shared/types/types.platform.posts';
import { PLATFORM } from './@shared/types/types.platforms';
import { AppPost } from './@shared/types/types.posts';
import { CollectionNames } from './@shared/utils/collectionNames';
import { activityEventCreatedHook } from './activity/activity.created.hook';
import { adminRouter } from './admin.router';
import {
  AUTOFETCH_NON_USER_PERIOD,
  AUTOFETCH_PERIOD,
  IS_EMULATOR,
} from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { buildAdminApp, buildApp } from './instances/app';
import { logger } from './instances/logger';
import { createServices } from './instances/services';
import { fetchPlatformAccountTask } from './platforms/platforms.tasks';
import {
  FETCH_ACCOUNT_TASKS,
  FETCH_TASK_DISPATCH_RATES,
} from './platforms/platforms.tasks.config';
import { platformPostUpdatedHook } from './posts/hooks/platformPost.updated.hook';
import { postUpdatedHook } from './posts/hooks/post.updated.hook';
import {
  AUTOFETCH_POSTS_TASK,
  autofetchUserPosts,
  triggerAutofetchPosts,
  triggerAutofetchPostsForNonUsers,
} from './posts/tasks/posts.autofetch.task';
import { PARSE_POST_TASK, parsePostTask } from './posts/tasks/posts.parse.task';
import { router } from './router';
import { getConfig } from './services.config';

// all secrets are available to all functions
const secrets: SecretParam[] = [
  envRuntime.CLERK_SECRET_KEY,
  envRuntime.TWITTER_CLIENT_SECRET,
  envRuntime.TWITTER_BEARER_TOKEN,
  envRuntime.MASTODON_ACCESS_TOKENS,
  envRuntime.BLUESKY_APP_PASSWORD,
  envRuntime.IFRAMELY_API_KEY,
];

const deployConfig: functions.RuntimeOptions = {
  timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
  memory: envDeploy.CONFIG_MEMORY,
  minInstances: envDeploy.CONFIG_MININSTANCE,
  secrets,
};

const deployConfigTasks: TaskQueueOptions = {
  timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
  memory: envDeploy.CONFIG_MEMORY_TASKS,
  minInstances: envDeploy.CONFIG_MININSTANCE,
  secrets,
};

const region = envDeploy.REGION;

export const appConfig = IS_EMULATOR
  ? {
      projectId: 'demo-sensenets',
    }
  : {};

const app = admin.initializeApp(appConfig);
export const firestore = app.firestore();

// import { fetchNewPosts } from './posts/posts.job';

/** Registed the API as an HTTP triggered function */
exports['api'] = functions
  .region(region)
  .runWith(deployConfig)
  .https.onRequest(
    buildApp(
      {
        publishableKey: envRuntime.CLERK_PUBLISHABLE_KEY.value(),
        secretKey: envRuntime.CLERK_SECRET_KEY.value(),
      },
      router
    )
  );

exports['admin'] = functions
  .region(envDeploy.REGION)
  .runWith({
    ...deployConfig,
    secrets: [...secrets, envRuntime.ADMIN_API_KEY],
  })
  .https.onRequest(
    buildAdminApp(
      {
        publishableKey: envRuntime.CLERK_PUBLISHABLE_KEY.value(),
        secretKey: envRuntime.CLERK_SECRET_KEY.value(),
      },
      adminRouter
    )
  );

/** jobs */
exports.accountFetch = onSchedule(
  {
    schedule: AUTOFETCH_PERIOD,
    secrets,
  },
  async () => {
    const services = createServices(firestore, getConfig());
    await triggerAutofetchPosts(services);
  }
);
exports.nonUserAccountFetch = onSchedule(
  {
    schedule: AUTOFETCH_NON_USER_PERIOD,
    secrets,
  },
  async () => {
    const services = createServices(firestore, getConfig());
    await triggerAutofetchPostsForNonUsers(services);
  }
);

/** tasks */
/**
 * Open Router rate limits: https://openrouter.ai/docs/limits
 *
 */
exports[PARSE_POST_TASK] = onTaskDispatched(
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

exports[AUTOFETCH_POSTS_TASK] = onTaskDispatched(
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
exports[FETCH_ACCOUNT_TASKS[PLATFORM.Twitter]] = onTaskDispatched(
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
exports[FETCH_ACCOUNT_TASKS[PLATFORM.Mastodon]] = onTaskDispatched(
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
exports[FETCH_ACCOUNT_TASKS[PLATFORM.Bluesky]] = onTaskDispatched(
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

const getBeforeAndAfterOnUpdate = <T>(
  event: FirestoreEvent<functions.Change<QueryDocumentSnapshot> | undefined>,
  idProperty: string
) => {
  const id = event.params[idProperty];
  const before = event.data?.before.data() as T;
  const after = event.data?.after.data() as T;

  if (!id || !before || !after) {
    throw new Error('Unexpected post data not found in onDocumentUpdated');
  }

  return {
    before: { ...before, id },
    after: { ...after, id },
  };
};

const getCreatedOnCreate = <T>(
  event: FirestoreEvent<QueryDocumentSnapshot | undefined>,
  idProperty: string
) => {
  const id = event.params[idProperty];
  const data = event.data?.data();

  if (!id || !data) {
    throw new Error('Unexpected data not found in onDocumentCreated');
  }

  return {
    id,
    ...data,
  } as T;
};

/** hooks */
exports.postUpdateListener = onDocumentUpdated(
  {
    document: `${CollectionNames.Posts}/{postId}`,
    secrets,
  },
  async (event) => {
    const { before, after } = getBeforeAndAfterOnUpdate<AppPost>(
      event,
      'postId'
    );
    await postUpdatedHook(
      after,
      createServices(firestore, getConfig()),
      before
    );
  }
);

exports.postCreateListener = onDocumentCreated(
  {
    document: `${CollectionNames.Posts}/{postId}`,
    secrets,
  },
  async (event) => {
    const created = getCreatedOnCreate<AppPost>(event, 'postId');
    await postUpdatedHook(created, createServices(firestore, getConfig()));
  }
);

exports.platformPostUpdateListener = onDocumentUpdated(
  {
    document: `${CollectionNames.PlatformPosts}/{platformPostId}`,
    secrets,
  },
  async (event) => {
    const { before, after } = getBeforeAndAfterOnUpdate<PlatformPost>(
      event,
      'platformPostId'
    );
    await platformPostUpdatedHook(
      after,
      createServices(firestore, getConfig()),
      before
    );
  }
);

exports.activityEventCreateListener = onDocumentCreated(
  {
    document: `${CollectionNames.Activity}/{activityEventId}`,
    secrets,
  },
  async (event) => {
    const created = getCreatedOnCreate<ActivityEventBase>(
      event,
      'activityEventId'
    );

    await activityEventCreatedHook(
      created,
      createServices(firestore, getConfig())
    );
  }
);

/** trigger endpoints to trigger scheduled tasks manually */
const emulatorTriggerRouter = express.Router();

emulatorTriggerRouter.post('/autofetch', async (request, response) => {
  logger.debug('autofetch triggered');
  await triggerAutofetchPosts(createServices(firestore, getConfig()));
  response.status(200).send({ success: true });
});

exports['trigger'] = functions
  .region(region)
  .runWith({
    ...deployConfig,
    secrets,
  })
  .https.onRequest(
    buildApp(
      {
        publishableKey: envRuntime.CLERK_PUBLISHABLE_KEY.value(),
        secretKey: envRuntime.CLERK_SECRET_KEY.value(),
      },
      emulatorTriggerRouter
    )
  );
