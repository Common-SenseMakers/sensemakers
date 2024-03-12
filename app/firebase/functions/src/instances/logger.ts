import pino from 'pino';

import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { NODE_ENV } from '../config/config';

/**
  https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity

  DEFAULT	(0) The log entry has no assigned severity level.
  DEBUG	(100) Debug or trace information.
  INFO	(200) Routine information, such as ongoing status or performance.
  NOTICE	(300) Normal but significant events, such as start up, shut down, or a configuration change.
  WARNING	(400) Warning events might cause problems.
  ERROR	(500) Error events are likely to cause problems.
  CRITICAL	(600) Critical events cause more severe problems or outages.
  ALERT	(700) A person must take an action immediately.
  EMERGENCY	(800) One or more systems are unusable.
*/

const customLevels = {
  default: 0,
  debug: 100,
  info: 200,
  notice: 300,
  warn: 400,
  error: 500,
  critical: 600,
  alert: 700,
  emergency: 800,
};

const pinoLevelToSeverityLookup: Record<string, string> = {
  default: 'DEFAULT',
  debug: 'DEBUG',
  info: 'INFO',
  notice: 'NOTICE',
  warn: 'WARNING',
  error: 'ERROR',
  critical: 'CRITICAL',
  alert: 'ALERT',
  emergency: 'EMERGENCY',
};

export const loggerPino = pino({
  messageKey: 'message',
  customLevels,
  formatters: {
    level(label, number) {
      return {
        severity:
          pinoLevelToSeverityLookup[label] || pinoLevelToSeverityLookup['info'],
        level: number,
      };
    },
    log(message) {
      return { ...message };
    },
  },
  ...(process.env.NODE_ENV === ENVIRONMENTS.LOCAL && {
    transport: {
      target: 'pino-pretty',
      options: {
        messageKey: 'message',
        colorize: true,
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        ignore: 'pid,hostname',
        messageOnly: true,
      },
    },
  }),
});

export const logger =
  NODE_ENV === ENVIRONMENTS.PRODUCTION ? loggerPino : (global as any).logger;
