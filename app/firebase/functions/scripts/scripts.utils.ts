import * as admin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import readline from 'readline';

import { AddProfilesPayload } from '../src/@shared/types/types.profiles';
import { logger } from '../src/instances/logger';

export const initApp = (
  config: AppOptions,
  name: string,
  host: string = 'localhost:8080'
) => {
  const app = admin.initializeApp(config, name);

  if (config.projectId?.startsWith('demo-')) {
    logger.info(`Connecting to emualtor - ${config.projectId}`);
    app.firestore().settings({
      host,
      ssl: false,
    });
  }

  return app;
};

export async function callAddProfiles(
  input: AddProfilesPayload,
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
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.json();
      logger.error(`Error calling addProfiles ${JSON.stringify(body)}`);
      throw new Error(`Error getting Orcid token: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error: any) {
    console.error(error.response?.data || error.message);
  }
}

export const askForConfirmation = (message: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
};
