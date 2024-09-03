import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

import { logger } from '../src/instances/logger';
import { createServices } from '../src/instances/services';

// Load environment variables from .env file
dotenv.config({ path: './migrations/.migrations.env' });

const mandatory = [
  'FB_CERT_PATH_SOURCE',
  'FB_PROJECT_ID_SOURCE',
  'FB_CERT_PATH_TARGET',
  'FB_PROJECT_ID_TARGET',
];

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

// const serviceAccountSource = require('../' + certPathSource);
const serviceAccountTarget = require('../' + certPathTarget);

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

export const appSource = admin.initializeApp(
  {
    projectId: projectIdSource,
  },
  'source'
);

export const appTarget = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccountTarget),
    projectId: projectIdTarget,
  },
  'target'
);

export const servicesSource = createServices(appSource.firestore());
export const servicesTarget = createServices(appTarget.firestore());
