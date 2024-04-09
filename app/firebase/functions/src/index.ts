import express from 'express';
import * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { POSTS_JOB_SCHEDULE } from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import {
  getSignupContextController,
  handleSignupController,
} from './controllers/platforms.auth.controller';
import { buildApp } from './instances/app';
import { fetchNewPosts } from './posts/posts.job';

const authRouter = express.Router();

authRouter.post('/auth/:platform/context', getSignupContextController);
authRouter.post('/auth/:platform/signup', handleSignupController);

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
  .https.onRequest(buildApp(authRouter));

export const postsJob = onSchedule(POSTS_JOB_SCHEDULE, fetchNewPosts);
