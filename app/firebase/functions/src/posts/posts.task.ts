import { getFunctions } from 'firebase-admin/functions';
import { Request } from 'firebase-functions/v2/tasks';
import { GoogleAuth } from 'google-auth-library';

import { createServices } from '../instances/services';

export const PARSE_USER_POSTS_TASK = 'parseUserPosts';

export const parseUserPostsTask = async (req: Request) => {
  const userId = req.data.userId;
  const { postsManager } = createServices();
  await postsManager.parseOfUser(userId);
};

export const enqueueParseUserPosts = async (
  userId: string,
  location: string
) => {
  const queue = getFunctions().taskQueue(PARSE_USER_POSTS_TASK);
  const targetUri = await getFunctionUrl(PARSE_USER_POSTS_TASK, location);
  await queue.enqueue({ userId }, { uri: targetUri });
};

/**
 * Get the URL of a given v2 cloud function.
 *
 * @param {string} name the function's name
 * @param {string} location the function's location
 * @return {Promise<string>} The URL of the function
 */
async function getFunctionUrl(name: string, location: string) {
  let auth: GoogleAuth | undefined = undefined;
  if (!auth) {
    auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
  }
  const projectId = await auth.getProjectId();

  if (process.env.NODE_ENV !== 'production') {
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
