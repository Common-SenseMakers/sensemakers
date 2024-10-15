import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

import { logger } from '../src/instances/logger';
import { createServices } from '../src/instances/services';
import { config } from './scripts.config';

// Load environment variables from .env file
dotenv.config({ path: './scripts/.script.env' });

const mandatory = ['FB_CERT_PATH', 'FB_PROJECT_ID', 'NANOPUBS_PUBLISH_SERVERS'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const serviceAccount = require('../' + process.env.FB_CERT_PATH);

logger.info('Running in local mode with certificate');
export const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FB_PROJECT_ID,
});

export const services = createServices(app.firestore(), config);
