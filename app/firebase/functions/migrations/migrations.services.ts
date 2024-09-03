import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

import { logger } from '../src/instances/logger';
import { createServices } from '../src/instances/services';

// Load environment variables from .env file
dotenv.config({ path: './scripts/.script.env' });

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

const serviceAccountSource = require('../' + process.env.FB_CERT_PATH_SOURCE);
const serviceAccountTarget = require('../' + process.env.FB_CERT_PATH_TARGET);

logger.info('Running in local mode with certificate');

export const appSource = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountSource),
  projectId: process.env.FB_PROJECT_ID_SOURCE,
});

export const appTarget = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountTarget),
  projectId: process.env.FB_PROJECT_ID_TARGET,
});

export const servicesSource = createServices(appSource.firestore());
export const servicesTarget = createServices(appTarget.firestore());
