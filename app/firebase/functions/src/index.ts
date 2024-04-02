import express from 'express';
import * as functions from 'firebase-functions';

import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import {
  getSignupContextController,
  handleSignupController,
} from './controllers/platforms.auth.controller';
import { buildApp } from './instances/app';

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
      envRuntime.TWITTER_API_SECRET_KEY,
      envRuntime.TWITTER_CLIENT_SECRET,
      envRuntime.TWITTER_BEARER_TOKEN,
    ],
  })
  .https.onRequest(buildApp(authRouter));
