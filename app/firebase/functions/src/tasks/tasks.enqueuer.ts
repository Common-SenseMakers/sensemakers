import { TaskOptions, getFunctions } from 'firebase-admin/functions';
import { GoogleAuth } from 'google-auth-library';

import { IS_EMULATOR, PROJECT_ID } from '../config/config.runtime';
import { envRuntime } from '../config/typedenv.runtime';
import { logger } from '../instances/logger';

export const queueOnEmulator = async (url: string, data: any) => {
  logger.debug(`queueOnEmulator ${url}`, { data });
  const res = await fetch(url, {
    headers: [['Content-Type', 'application/json']],
    method: 'post',
    body: JSON.stringify({ data }),
  });
  return res;
};

/**
 * Get the URL of a given v2 cloud function.
 *
 * @param name the function's name
 * @param location the function's location
 * @return The URL of the function
 */
export async function getFunctionUrl(name: string, location: string) {
  let auth: GoogleAuth | undefined = undefined;
  if (!auth) {
    auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
      projectId: PROJECT_ID.value(),
    });
  }
  const projectId = await auth.getProjectId();
  if (envRuntime.NODE_ENV !== 'production') {
    return `http://127.0.0.1:5001/${projectId}/${location}/${name}`;
  }

  const url =
    'https://cloudfunctions.googleapis.com/v2beta/' +
    `projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  const res = await client.request<{ serviceConfig: { uri: string } }>({ url });

  const realUri = res.data?.serviceConfig?.uri;

  if (!realUri) {
    throw new Error(`Unable to retreive uri for function at ${url}`);
  }
  return realUri;
}

export const enqueueTaskProduction = async (
  name: string,
  params: any,
  taskOptions?: TaskOptions
) => {
  const location = envRuntime.REGION || 'us-central1';
  const targetUri = await getFunctionUrl(name, location);

  if (IS_EMULATOR) {
    logger.debug(`enqueue ${name} - isEmulator`);
    /** Emulator does not support queue.enqueue(), but uses a simple http request */
    return queueOnEmulator(targetUri, params);
  }

  const queue = getFunctions().taskQueue(name);
  /** enqueue */
  logger.debug(`enqueue ${name}`, { params, targetUri });

  return queue.enqueue(params, { ...taskOptions, uri: targetUri });
};
