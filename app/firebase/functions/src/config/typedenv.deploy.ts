import { defineInt, defineString } from 'firebase-functions/params';

const CONFIG_TIMEOUT = defineInt('CONFIG_TIMEOUT');
const CONFIG_TIMEOUT_PARSER = defineInt('CONFIG_TIMEOUT_PARSER');

const CONFIG_MEMORY = defineInt('CONFIG_MEMORY');
const CONFIG_MININSTANCE = defineInt('CONFIG_MININSTANCE');
const REGION = defineString('REGION');

export const envDeploy = {
  NODE_ENV: process.env.NODE_ENV,
  CONFIG_TIMEOUT: CONFIG_TIMEOUT,
  CONFIG_TIMEOUT_PARSER: CONFIG_TIMEOUT_PARSER,
  CONFIG_MEMORY: CONFIG_MEMORY as any,
  CONFIG_MININSTANCE: CONFIG_MININSTANCE,
  REGION: REGION,
};
