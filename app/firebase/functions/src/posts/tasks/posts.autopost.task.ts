import { Request } from 'firebase-functions/v2/tasks';

import { PLATFORM } from '../../@shared/types/types.platforms';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';

const DEBUG = false;
export const AUTOPOST_POST_TASK = 'autopostPost';

/** Sensitive (cannot be public) */
export const autopostPostTask = async (req: Request, services: Services) => {
  if (DEBUG) logger.debug(`autopostPost: postId: ${req.data.postId}`);
  const postId = req.data.postId as string;
  const platformIds = req.data.platformIds as PLATFORM[];

  if (!postId) {
    throw new Error('postId is required');
  }

  if (!platformIds) {
    throw new Error('platformsIds is required');
  }

  const { db, postsManager } = services;
  return db.run(async (manager) => {
    const post = await postsManager.processing.getPostFull(
      postId,
      manager,
      true
    );

    await postsManager.publishPost(post, platformIds, manager, true);
  });
};
