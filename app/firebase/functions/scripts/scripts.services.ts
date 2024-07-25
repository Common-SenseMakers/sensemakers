import dotenv from 'dotenv';

import { createServices } from '../src/instances/services';

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

export const services = createServices();
