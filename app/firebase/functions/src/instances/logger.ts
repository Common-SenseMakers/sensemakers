import { logger as fblogger } from 'firebase-functions/v1';

import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { envDeploy } from '../config/typedenv.deploy';
import { LocalLogger, LogLevel } from './local.logger';

export const logger = (() => {
  if (envDeploy.NODE_ENV === ENVIRONMENTS.TEST) {
    return new LocalLogger(
      (envDeploy.LOG_LEVEL_MSG.value() as LogLevel) || LogLevel.warn,
      (envDeploy.LOG_LEVEL_OBJ.value() as LogLevel) || LogLevel.warn,
      ['Testing authorization']
    );
  }

  if (envDeploy.NODE_ENV === ENVIRONMENTS.PRODUCTION) {
    return fblogger;
  }

  throw new Error('Unexpected environment');
})();
