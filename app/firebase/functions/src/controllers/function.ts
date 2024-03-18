import express from 'express';
import * as functions from 'firebase-functions';

import { RUNTIME_OPTIONS } from '../config/RUNTIME_OPTIONS';
import { REGION } from '../config/config';
import { buildApp } from '../instances/app';
import { getSignupContextController } from './platform.auth';

const authRouter = express.Router();

authRouter.post('/auth/:platform/context', getSignupContextController);

export const app = functions
  .region(REGION)
  .runWith({ ...RUNTIME_OPTIONS })
  .https.onRequest(buildApp(authRouter));
