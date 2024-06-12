import { Request } from 'firebase-functions/v2/tasks';

import { PLATFORM } from '../../@shared/types/types.user';
import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';

export const AUTOPOST_POST_TASK = 'autopostPost';

/** Sensitive (cannot be public) */
export const autopostPostTask = async (req: Request) => {
  logger.debug(`autopostPost: postId: ${req.data.postId}`);
  const postId = req.data.postId;
  const platformsIds = req.data.platformsIds;

  const { db, postsManager } = createServices();
  db.run(async (manager) => {
    const post = await postsManager.processing.getPostFull(
      postId,
      manager,
      true
    );

    await postsManager.publishPost(
      post,
      platformsIds as PLATFORM[],
      post.authorId,
      manager
    );
  });
};
