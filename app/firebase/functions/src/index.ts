import * as functions from 'firebase-functions';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';

import { CollectionNames } from './@shared/utils/collectionNames';
// import { onSchedule } from 'firebase-functions/v2/scheduler';
// import { POSTS_JOB_SCHEDULE } from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { buildApp } from './instances/app';
import { logger } from './instances/logger';
import { createServices } from './instances/services';
import { PARSE_USER_POSTS_TASK, parseUserPostsTask } from './posts/posts.task';
import { router } from './router';

// import { fetchNewPosts } from './posts/posts.job';

/** Registed the API as an HTTP triggered function */
exports['api'] = functions
  .region(envDeploy.REGION)
  .runWith({
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets: [
      envRuntime.ORCID_SECRET,
      envRuntime.OUR_TOKEN_SECRET,
      envRuntime.TWITTER_CLIENT_SECRET,
    ],
  })
  .https.onRequest(buildApp(router));

// export const postsJob = onSchedule(POSTS_JOB_SCHEDULE, fetchNewPosts);

/** Registed the parseUserPost task */
exports[PARSE_USER_POSTS_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
  },
  parseUserPostsTask
);

exports.postUpdateListener = onDocumentUpdated(
  `${CollectionNames.Posts}/{postId}`,
  async (event) => {
    const postId = event.params?.postId;
    const { db } = createServices();
    const updateRef = db.collections.updates.doc(`post-${postId}`);
    const now = Date.now();
    logger.debug(`triggerUpdate post-${postId}-${now}`);
    await db.run(async (manager) => {
      manager.set(updateRef, { value: now });
    });
  }
);

exports.platformPostUpdateListener = onDocumentUpdated(
  `${CollectionNames.PlatformPosts}/{platformPostId}`,
  async (event) => {
    const platformPostId = event.params?.platformPostId;
    const { db } = createServices();
    const updateRef = db.collections.updates.doc(
      `platformPost-${platformPostId}`
    );
    const now = Date.now();
    logger.debug(`triggerUpdate platformPost-${platformPostId}-${now}`);
    await db.run(async (manager) => {
      manager.set(updateRef, { value: now });
    });
  }
);
