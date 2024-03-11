import { RuntimeOptions } from 'firebase-functions/v1';

export const RUNTIME_OPTIONS: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '512MB',
  minInstances: 1,
};
