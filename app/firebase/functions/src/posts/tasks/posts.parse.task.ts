import { Request } from 'firebase-functions/v2/tasks';

import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';

export const PARSE_POST_TASK = 'parsePost';

export const parsePostTask = async (req: Request) => {
  logger.debug(`parsePostTask: postId: ${req.data.postId}`);
  const postId = req.data.postId as string;

  if (!postId) {
    throw new Error('postId is required');
  }

  const { postsManager } = createServices();
  return postsManager.parsePost(postId);
};
