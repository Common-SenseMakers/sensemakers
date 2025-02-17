import express from 'express';
import * as functions from 'firebase-functions';
import {
  FirestoreEvent,
  QueryDocumentSnapshot,
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';

import { ActivityEventBase } from './@shared/types/types.activity';
import { PlatformPost } from './@shared/types/types.platform.posts';
import { PLATFORM } from './@shared/types/types.platforms';
import { AppPost } from './@shared/types/types.posts';
import { CollectionNames } from './@shared/utils/collectionNames';
import { activityEventCreatedHook } from './activity/activity.created.hook';
import { adminRouter } from './admin.router';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { deployConfig, firestore, region, secrets } from './firestore.config';
import { buildAdminApp, buildApp } from './instances/app';
import { logger } from './instances/logger';
import { createServices } from './instances/services';
import {
  accountFetchJobHandler,
  nonUserAccountFetchJobHandler,
  syncPostMetricsJobHandler,
} from './jobs/jobs.handlers';
import { FETCH_ACCOUNT_TASKS } from './platforms/platforms.tasks.config';
import { platformPostUpdatedHook } from './posts/hooks/platformPost.updated.hook';
import { postUpdatedHook } from './posts/hooks/post.updated.hook';
import {
  AUTOFETCH_POSTS_TASK,
  triggerAutofetchPosts,
} from './posts/tasks/posts.autofetch.task';
import { PARSE_POST_TASK } from './posts/tasks/posts.parse.task';
import { REPLACE_USER_TASK } from './posts/tasks/replace.user.task';
import { router } from './router';
import { getConfig } from './services.config';
import {
  autoFetchPostsTaskHandler,
  fetchBlueskyAccountTaskHandler,
  fetchMastodonAccountTaskHandler,
  fetchTwitterAccountTaskHandler,
  parsePostTaskHandler,
  replaceUserTaskHandler,
} from './tasks/tasks.handlers';

/** Registed the API as an HTTP triggered function */
exports['api'] = functions
  .region(region)
  .runWith(deployConfig)
  .https.onRequest(buildApp(() => getConfig().clerk, router));

exports['admin'] = functions
  .region(envDeploy.REGION)
  .runWith({
    ...deployConfig,
    secrets: [...secrets, envRuntime.ADMIN_API_KEY],
  })
  .https.onRequest(buildAdminApp(() => getConfig().clerk, adminRouter));

/** jobs */
exports.accountFetch = accountFetchJobHandler;
exports.nonUserAccountFetch = nonUserAccountFetchJobHandler;
exports.syncPostMetrics = syncPostMetricsJobHandler;

/** tasks */
exports[PARSE_POST_TASK] = parsePostTaskHandler;

exports[AUTOFETCH_POSTS_TASK] = autoFetchPostsTaskHandler;

exports[FETCH_ACCOUNT_TASKS[PLATFORM.Twitter]] = fetchTwitterAccountTaskHandler;

exports[FETCH_ACCOUNT_TASKS[PLATFORM.Mastodon]] =
  fetchMastodonAccountTaskHandler;

exports[FETCH_ACCOUNT_TASKS[PLATFORM.Bluesky]] = fetchBlueskyAccountTaskHandler;

exports[REPLACE_USER_TASK] = replaceUserTaskHandler;

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
  .https.onRequest(buildApp(() => getConfig().clerk, emulatorTriggerRouter));
