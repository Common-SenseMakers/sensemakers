import * as admin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';

import { logger } from '../src/instances/logger';

export const initApp = (config: AppOptions, name: string) => {
  const app = admin.initializeApp(config, name);

  if (config.projectId?.startsWith('demo-')) {
    logger.info(`Connecting to emualtor - ${config.projectId}`);
    app.firestore().settings({
      host: 'localhost:8080',
      ssl: false,
    });
  }

  return app;
};
