import { RuntimeOptions } from 'firebase-functions/v1';

import { ENVIRONMENTS } from './ENVIRONMENTS';
import { env } from './env';

export const RUNTIME_OPTIONS: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '4GB',
  ...(env.environment === ENVIRONMENTS.PRODUCTION && { minInstances: 1 }),
};
