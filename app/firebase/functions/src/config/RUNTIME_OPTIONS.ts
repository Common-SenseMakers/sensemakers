import { RuntimeOptions } from 'firebase-functions/v1';

import { envDeploy } from './typedenv.deploy';

export const RUNTIME_OPTIONS: RuntimeOptions = {
  timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
  memory: envDeploy.CONFIG_MEMORY,
  minInstances: envDeploy.CONFIG_MININSTANCE,
};
