import { Request } from 'firebase-functions/v2/tasks';

import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';

const DEBUG = false;

export const parsePostTask = async (req: Request, services: Services) => {
  if (DEBUG) logger.debug(`parsePostTask: postId: ${req.data.postId}`);
  const postId = req.data.postId as string;

  if (!postId) {
    throw new Error('postId is required');
  }

  const { postsManager } = services;
  return postsManager.parsePost(postId);
};
