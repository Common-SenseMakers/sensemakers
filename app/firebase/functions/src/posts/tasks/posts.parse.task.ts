import { Request } from 'firebase-functions/v2/tasks';

import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';

export const PARSE_POST_TASK = 'parsePost';

export const parsePostTask = async (req: Request, services: Services) => {
  logger.debug(`parsePostTask: postId: ${req.data.postId}`);
  const postId = req.data.postId as string;

  if (!postId) {
    throw new Error('postId is required');
  }

  const { postsManager } = services;
  return postsManager.parsePost(postId);
};
