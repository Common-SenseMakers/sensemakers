import * as admin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';

import { LocalLogger, LogLevel } from '../src/instances/local.logger';
import { logger } from '../src/instances/logger';
import { createServices } from '../src/instances/services';
import { config } from './migrations.config';

// update log levels

if (process.env.LOG_LEVEL_MSG && process.env.LOG_LEVEL_OBJ) {
  (logger as LocalLogger).msgLevel = process.env.LOG_LEVEL_MSG as LogLevel;
  (logger as LocalLogger).ctxLevel = process.env.LOG_LEVEL_OBJ as LogLevel;
}

const mandatory: string[] = [];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const projectIdSource = process.env.FB_PROJECT_ID_SOURCE;
const projectIdTarget = process.env.FB_PROJECT_ID_TARGET;
const certPathSource = process.env.FB_CERT_PATH_SOURCE;
const certPathTarget = process.env.FB_CERT_PATH_TARGET;

const serviceAccountSource = certPathSource && require('../' + certPathSource);
const serviceAccountTarget = certPathTarget && require('../' + certPathTarget);

logger.info('Running in local mode with certificate', {
  projectIdSource,
  projectIdTarget,
  certPathSource,
  certPathTarget,
});

// export const appSource = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountSource),
//   projectId: process.env.FB_PROJECT_ID_SOURCE,
// });

const initApp = (config: AppOptions, name: string) => {
  const app = admin.initializeApp(config, name);

  if (config.projectId?.startsWith('demo-')) {
    app.firestore().settings({
      host: 'localhost:8080',
      ssl: false,
    });
  }

  return app;
};

export const appSource = initApp(
  serviceAccountSource
    ? {
        projectId: projectIdSource,
        credential: admin.credential.cert(serviceAccountSource),
      }
    : { projectId: projectIdSource },
  'source'
);
export const appTarget = initApp(
  serviceAccountTarget
    ? {
        projectId: projectIdTarget,
        credential: admin.credential.cert(serviceAccountTarget),
      }
    : { projectId: projectIdTarget },
  'target'
);

export const servicesSource = createServices(appSource.firestore(), config);
export const servicesTarget = createServices(appTarget.firestore(), config);
