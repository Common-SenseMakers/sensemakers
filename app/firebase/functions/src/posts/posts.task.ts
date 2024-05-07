import { getFunctions } from 'firebase-admin/functions';
import { Request } from 'firebase-functions/v2/tasks';
import { GoogleAuth } from 'google-auth-library';

import { IS_EMULATOR, PROJECT_ID } from '../config/config.runtime';
import { envRuntime } from '../config/typedenv.runtime';
import { logger } from '../instances/logger';
import { createServices } from '../instances/services';

export const PARSE_USER_POSTS_TASK = 'parseUserPosts';

export const queueOnEmulator = async (url: string, data: any) => {
  const res = await fetch(url, {
    headers: [['Content-Type', 'application/json']],
    method: 'post',
    body: JSON.stringify({ data }),
  });
  return res;
};

export const parseUserPostsTask = async (req: Request) => {
  logger.debug(`parseUserPostsTask: userId: ${req.data.userId}`);
  const userId = req.data.userId;
  const { postsManager } = createServices();
  await postsManager.parseOfUser(userId);
};

export const enqueueParseUserPosts = async (
  userId: string,
  location: string
) => {
  const targetUri = await getFunctionUrl(PARSE_USER_POSTS_TASK, location);

  if (IS_EMULATOR) {
    logger.debug(`enqueue ParseUserPosts - isEmulator`);
    /** Emulator does not support queue.enqueue(), but uses a simple http request */
    return queueOnEmulator(targetUri, { userId });
  }

  const queue = getFunctions().taskQueue(PARSE_USER_POSTS_TASK);
  /** enqueue */
  logger.debug(`enqueueParseUserPosts - enqueue`, { userId, targetUri });

  return queue.enqueue({ userId }, { uri: targetUri });
};

/**
 * Get the URL of a given v2 cloud function.
 *
 * @param name the function's name
 * @param location the function's location
 * @return The URL of the function
 */
async function getFunctionUrl(name: string, location: string) {
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
