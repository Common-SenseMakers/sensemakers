import { defineInt, defineString } from 'firebase-functions/params';

const LOG_LEVEL_MSG = defineString('LOG_LEVEL_MSG');
const LOG_LEVEL_OBJ = defineString('LOG_LEVEL_OBJ');

const CONFIG_TIMEOUT = defineInt('CONFIG_TIMEOUT');
const CONFIG_MEMORY = defineString('CONFIG_MEMORY');
const CONFIG_MININSTANCE = defineInt('CONFIG_MININSTANCE');
const REGION = defineString('LOG_LEVEL_OBJ');

export const envDeploy = {
  NODE_ENV: process.env.NODE_ENV,
  CONFIG_TIMEOUT: CONFIG_TIMEOUT,
  CONFIG_MEMORY: CONFIG_MEMORY as any,
  CONFIG_MININSTANCE: CONFIG_MININSTANCE,
  LOG_LEVEL_MSG: LOG_LEVEL_MSG,
  LOG_LEVEL_OBJ: LOG_LEVEL_OBJ,
  REGION: REGION,
};
