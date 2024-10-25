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
import {
  TaskQueueOptions,
  onTaskDispatched,
} from 'firebase-functions/v2/tasks';

import { ActivityEventBase } from './@shared/types/types.activity';
import { PlatformPost } from './@shared/types/types.platform.posts';
import { AppPost } from './@shared/types/types.posts';
import { CollectionNames } from './@shared/utils/collectionNames';
import { activityEventCreatedHook } from './activity/activity.created.hook';
import { adminRouter } from './admin.router';
import { IS_EMULATOR } from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { buildAdminApp, buildApp } from './instances/app';
import { logger } from './instances/logger';
import { createServices } from './instances/services';
import {
  FETCH_BLUESKY_ACCOUNT_TASK,
  FETCH_MASTODON_ACCOUNT_TASK,
  FETCH_TWITTER_ACCOUNT_TASK,
  fetchPlatformAccountTask,
} from './platforms/platforms.tasks';
import { platformPostUpdatedHook } from './posts/hooks/platformPost.updated.hook';
import { postUpdatedHook } from './posts/hooks/post.updated.hook';
import {
  AUTOFETCH_POSTS_TASK,
  autofetchUserPosts,
  triggerAutofetchPosts,
} from './posts/tasks/posts.autofetch.task';
import {
  AUTOPOST_POST_TASK,
  autopostPostTask,
} from './posts/tasks/posts.autopost.task';
import { PARSE_POST_TASK, parsePostTask } from './posts/tasks/posts.parse.task';
import { router } from './router';
import { getConfig } from './services.config';

// all secrets are available to all functions
const secrets: SecretParam[] = [
  envRuntime.ORCID_SECRET,
  envRuntime.OUR_TOKEN_SECRET,
  envRuntime.TWITTER_CLIENT_SECRET,
  envRuntime.TWITTER_BEARER_TOKEN,
  envRuntime.MASTODON_ACCESS_TOKENS,
  envRuntime.BLUESKY_APP_PASSWORD,
  envRuntime.NP_PUBLISH_RSA_PRIVATE_KEY,
  envRuntime.EMAIL_CLIENT_SECRET,
  envRuntime.MAGIC_ADMIN_SECRET,
  envRuntime.IFRAMELY_API_KEY,
  envRuntime.BLUESKY_APP_PASSWORD,
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
const firestore = app.firestore();

// import { fetchNewPosts } from './posts/posts.job';

/** Registed the API as an HTTP triggered function */
exports['api'] = functions
  .region(region)
  .runWith(deployConfig)
  .https.onRequest(buildApp(router));

exports['admin'] = functions
  .region(envDeploy.REGION)
  .runWith({
    ...deployConfig,
    secrets: [...secrets, envRuntime.ADMIN_API_KEY],
  })
  .https.onRequest(buildAdminApp(adminRouter));

/** jobs */
// exports.accountFetch = onSchedule(
//   {
//     schedule: AUTOFETCH_PERIOD,
//     secrets,
//   },
//   () => triggerAutofetchPosts(createServices(firestore, getConfig()))
// );

/** tasks */
exports[PARSE_POST_TASK] = onTaskDispatched(
  {
    ...deployConfigTasks,
    maxInstances: 1,
    retryConfig: {
      maxAttempts: 5,
    },
    concurrency: 50,
    rateLimits: {
      maxConcurrentDispatches: 50,
      maxDispatchesPerSecond: 50,
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

exports[AUTOPOST_POST_TASK] = onTaskDispatched(deployConfigTasks, (req) =>
  autopostPostTask(req, createServices(firestore, getConfig()))
);

/**
 * GET_2_users_param_tweets: https://developer.x.com/en/docs/x-api/rate-limits#v2-limits-basic
 * 10 requests / 15 min per app
 * 5 requests / 15 min per user
 */
exports[FETCH_TWITTER_ACCOUNT_TASK] = onTaskDispatched(
  {
    secrets,
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60 * 5,
    },
    rateLimits: {
      maxConcurrentDispatches: 1, // 1 task dispatched at a time
      maxDispatchesPerSecond: 1 / (60 * 2), // max 1 task every 2 minutes
    },
  },
  (req) => fetchPlatformAccountTask(req, createServices(firestore, getConfig()))
);

/**
 * rate limits: https://docs-p.joinmastodon.org/api/rate-limits/
 * 300 requests / 5 min per account
 */
exports[FETCH_MASTODON_ACCOUNT_TASK] = onTaskDispatched(
  {
    secrets,
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 100,
      maxDispatchesPerSecond: 1, // max 1 task every second
    },
  },
  (req) => fetchPlatformAccountTask(req, createServices(firestore, getConfig()))
);

/**
 * com.atproto.server.createSession (for now this is the limiting API call since we login with username and app password each fetch)
 * Measured per account
 * 30 per 5 minutes
 * 300 per day
 */
exports[FETCH_BLUESKY_ACCOUNT_TASK] = onTaskDispatched(
  {
    secrets,
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 10,
      maxDispatchesPerSecond: 1 / 10, // max 6 task every 1 minutes
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
  .https.onRequest(buildApp(emulatorTriggerRouter));

/** admin */
exports['admin'] = functions
  .region(region)
  .runWith({
    ...deployConfig,
    secrets: [...secrets, envRuntime.ADMIN_API_KEY],
  })
  .https.onRequest(buildAdminApp(adminRouter));
