import * as admin from 'firebase-admin';

import { LocalLogger, LogLevel } from '../src/instances/local.logger';
import { logger } from '../src/instances/logger';
import { createServices } from '../src/instances/services';
import { config } from './scripts.config';
import { initApp } from './scripts.utils';

(logger as LocalLogger).msgLevel = process.env.LOG_LEVEL_MSG as LogLevel;
(logger as LocalLogger).ctxLevel = process.env.LOG_LEVEL_OBJ as LogLevel;

const mandatory = ['FB_CERT_PATH', 'FB_PROJECT_ID', 'NANOPUBS_PUBLISH_SERVERS'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const serviceAccount = require('../' + process.env.FB_CERT_PATH);

const projectId = process.env.FB_PROJECT_ID;

export const app = initApp(
  serviceAccount
    ? {
        projectId,
        credential: admin.credential.cert(serviceAccount),
      }
    : { projectId },
  'source'
);

export const services = createServices(app.firestore(), config);
