import { getFunctions } from 'firebase-admin/functions';
import { Request } from 'firebase-functions/v2/tasks';
import { GoogleAuth } from 'google-auth-library';

import { IS_EMULATOR } from '../config/config.runtime';
import { envRuntime } from '../config/typedenv.runtime';
import { createServices } from '../instances/services';

export const PARSE_USER_POSTS_TASK = 'parseUserPosts';

export const queueOnEmulator = async (url: string, data: any) => {
  return fetch(url, {
    headers: [
      ['Accept', 'application/json'],
      ['Content-Type', 'application/json'],
    ],
    method: 'post',
    body: JSON.stringify({ data }),
  });
};

export const parseUserPostsTask = async (req: Request) => {
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
    /** Emulator does not support queue.enqueue(), but uses a simple http request */
    return queueOnEmulator(targetUri, { userId });
  }

  const queue = getFunctions().taskQueue(PARSE_USER_POSTS_TASK);
  /** enqueue */
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
    });
  }
  const projectId = await auth.getProjectId();

  if (envRuntime.NODE_ENV !== 'production') {
    return `http://localhost:5001/${projectId}/${location}/${name}`;
  }

  const url =
    'https://cloudfunctions.googleapis.com/v2beta/' +
    `projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  const res = await client.request<{ serviceConfig: { uri: string } }>({ url });

  const uri = res.data?.serviceConfig?.uri;

  if (!uri) {
    throw new Error(`Unable to retreive uri for function at ${url}`);
  }
  return url;
}
