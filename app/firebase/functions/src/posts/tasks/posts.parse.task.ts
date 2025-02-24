import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';
import { ParsePostTaskParams } from '../../tasks/types.tasks';

const DEBUG = false;

export const parsePostTask = async (
  req: { data: ParsePostTaskParams },
  services: Services
) => {
  if (DEBUG) logger.debug(`parsePostTask: postId: ${req.data.postId}`);
  const postId = req.data.postId as string;

  if (!postId) {
    throw new Error('postId is required');
  }

  const { postsManager } = services;
  return postsManager.parsePost(postId);
};
