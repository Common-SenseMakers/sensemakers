import { getFunctions } from 'firebase-admin/functions';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { GoogleAuth } from 'google-auth-library';

import { createServices } from '../instances/services';

exports.parseUserPosts = onTaskDispatched({}, async (req) => {
  const userId = req.data.userId;
  const { postsManager } = createServices();
  await postsManager.parseOfUser(userId);
});

export const enqueueParseUserPosts = async (userId: string) => {
  const queue = getFunctions().taskQueue('parseUserPosts');
  const targetUri = await getFunctionUrl('parseUserPosts');
  await queue.enqueue({ userId }, { uri: targetUri });
};

/**
 * Get the URL of a given v2 cloud function.
 *
 * @param {string} name the function's name
 * @param {string} location the function's location
 * @return {Promise<string>} The URL of the function
 */
async function getFunctionUrl(name: string, location = 'us-central1') {
  let auth: GoogleAuth | undefined = undefined;
  if (!auth) {
    auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
  }
  const projectId = await auth.getProjectId();
  const url =
    'https://cloudfunctions.googleapis.com/v2beta/' +
    `projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  const res = await client.request({ url });
  // @ts-ignore
  const uri = res.data?.serviceConfig?.uri;
  if (!uri) {
    throw new Error(`Unable to retreive uri for function at ${url}`);
  }
  return uri;
}
