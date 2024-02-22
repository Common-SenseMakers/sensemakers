import express from 'express';
import * as functions from 'firebase-functions';

import { RUNTIME_OPTIONS } from '../config/RUNTIME_OPTIONS';
import { REGION } from '../config/config';
import { app } from '../instances/app';
import { authCodeController } from './controllers/code.controller';
import { potEthDetailsUserController } from './controllers/ethdetails.controller';
import {
  getTwitterCodeController,
  postTwitterVerifierController,
} from './controllers/twitter.controller';
import { getLoggedUserController } from './controllers/user.controller';

const authRouter = express.Router();

authRouter.post('/code', authCodeController);
authRouter.post('/twitter-code', getTwitterCodeController);
authRouter.post('/twitter-verifier', postTwitterVerifierController);
authRouter.post('/me', getLoggedUserController);
authRouter.post('/eth', potEthDetailsUserController);

export const authApp = functions
  .region(REGION)
  .runWith({ ...RUNTIME_OPTIONS })
  .https.onRequest(app(authRouter));
