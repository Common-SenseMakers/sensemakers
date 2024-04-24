import express from 'express';
import * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { POSTS_JOB_SCHEDULE } from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { buildApp } from './instances/app';
import {
  fetchUserPostsController,
  getPostController,
  getUserPostsController,
  triggerParseController,
} from './posts/controllers/posts.controller';
import { fetchNewPosts } from './posts/posts.job';
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
router.post('/posts/triggerParse', triggerParseController);

export const app = functions
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

export const postsJob = onSchedule(POSTS_JOB_SCHEDULE, fetchNewPosts);

// TODO: Configure a task that will parse all the unparsed posts of a user
