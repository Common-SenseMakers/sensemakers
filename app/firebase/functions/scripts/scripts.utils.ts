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

export async function callAddProfiles(
  accounts: string[],
  functionsUrl: string,
  adminApiKey: string
) {
  try {
    const response = await fetch(`${functionsUrl}/admin/addProfiles`, {
      headers: [
        ['Content-Type', 'application/json'],
        ['admin-api-key', adminApiKey],
      ],
      method: 'post',
      body: JSON.stringify(accounts),
    });

    if (!response.ok) {
      const body = await response.json();
      logger.error(`Error getting Orcid token ${JSON.stringify(body)}`);
      throw new Error(`Error getting Orcid token: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error: any) {
    console.error(error.response?.data || error.message);
  }
}
