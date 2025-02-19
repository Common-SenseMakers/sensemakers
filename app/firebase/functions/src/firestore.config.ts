import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { SecretParam } from 'firebase-functions/lib/params/types';

import { IS_EMULATOR } from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';

export const region = envDeploy.REGION;

export const appConfig = IS_EMULATOR
  ? {
      projectId: 'demo-sensenets',
    }
  : {};

const app = admin.initializeApp(appConfig);
export const firestore = app.firestore();

export const secrets: SecretParam[] = [
  envRuntime.CLERK_SECRET_KEY,
  envRuntime.TWITTER_CLIENT_SECRET,
  envRuntime.TWITTER_BEARER_TOKEN,
  envRuntime.MASTODON_ACCESS_TOKENS,
  envRuntime.BLUESKY_APP_PASSWORD,
  envRuntime.IFRAMELY_API_KEY,
];

export const deployConfig: functions.RuntimeOptions = {
  timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
  memory: envDeploy.CONFIG_MEMORY,
  minInstances: envDeploy.CONFIG_MININSTANCE,
  secrets,
};
