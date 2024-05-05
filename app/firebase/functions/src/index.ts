import express from 'express';
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
import {
  approvePostController,
  createDraftPostController,
  fetchUserPostsController,
  getPostController,
  getUserPostsController,
} from './posts/controllers/posts.controller';
import { PARSE_USER_POSTS_TASK, parseUserPostsTask } from './posts/posts.task';
// import { fetchNewPosts } from './posts/posts.job';
import { getLoggedUserController } from './users/controllers/get.logged.controller';
import {
  getSignupContextController,
  handleSignupController,
} from './users/controllers/platforms.auth.controller';

const router = express.Router();

router.post('/auth/:platform/context', getSignupContextController);
router.post('/auth/:platform/signup', handleSignupController);
router.post('/auth/me', getLoggedUserController);

router.post('/posts/getOfUser', getUserPostsController);
router.post('/posts/fetch', fetchUserPostsController);
router.post('/posts/get', getPostController);
router.post('/posts/createDraft', createDraftPostController);
router.post('/posts/approve', approvePostController);

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
  (event) => {
    const postId = event.params?.postId;
    const { db } = createServices();
    const updateRef = db.collections.updates.doc(`post-${postId}`);
    const now = Date.now();
    logger.debug(`triggerUpdate post-${postId}-${now}`);
    db.run(async (manager) => {
      manager.set(updateRef, { value: now });
    });
  }
);

exports.platformPostUpdateListener = onDocumentUpdated(
  `${CollectionNames.PlatformPosts}/{platformPostId}`,
  (event) => {
    const platformPostId = event.params?.platformPostId;
    const { db } = createServices();
    const updateRef = db.collections.updates.doc(
      `platformPost-${platformPostId}`
    );
    const now = Date.now();
    logger.debug(`triggerUpdate platformPost-${platformPostId}-${now}`);
    db.run(async (manager) => {
      manager.set(updateRef, { value: now });
    });
  }
);
