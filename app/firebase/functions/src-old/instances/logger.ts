import { logger as fblogger } from 'firebase-functions/v1';

import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { envRuntime } from '../config/typedenv.runtime';
import { LocalLogger, LogLevel } from './local.logger';

export const logger = (() => {
  if (envRuntime.NODE_ENV !== ENVIRONMENTS.PRODUCTION) {
    return new LocalLogger(
      (envRuntime.LOG_LEVEL_MSG.value() as LogLevel) || LogLevel.warn,
      (envRuntime.LOG_LEVEL_OBJ.value() as LogLevel) || LogLevel.warn,
      undefined,
      (envRuntime.OUTPUT_LOG_FILE as string) || undefined
    );
  } else {
    return fblogger;
  }
})();
