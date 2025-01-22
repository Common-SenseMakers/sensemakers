import * as admin from 'firebase-admin';

import { initApp } from '../scripts/scripts.utils';
import { createServices as createServicesOld } from '../src-old/instances/services';
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

logger.info(
  `Running locally - sourceProject: ${projectIdSource} - targetProject: ${projectIdTarget}`,
  {
    projectIdSource,
    projectIdTarget,
    certPathSource,
    certPathTarget,
  }
);

export const appSource = initApp(
  serviceAccountSource
    ? {
        projectId: projectIdSource,
        credential: admin.credential.cert(serviceAccountSource),
      }
    : { projectId: projectIdSource },
  'source',
  'localhost:8081'
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

export const servicesSource = createServicesOld(appSource.firestore(), config);
export const servicesTarget = createServices(appTarget.firestore(), config);
