import { Request } from 'firebase-functions/v2/tasks';

import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';
import { enqueueTask } from '../../tasksUtils/tasks.support';

export const AUTOFETCH_POSTS_TASK = 'autofetchPosts';

const DEBUG_PREFIX = 'AUTOFETCH';

export const triggerAutofetchPosts = async () => {
  logger.debug(`triggerAutofetchPosts`, undefined, DEBUG_PREFIX);
  const { users } = createServices();

  const usersIds = await users.repo.getAll();

  logger.debug(`number of users: ${usersIds.length}`, undefined, DEBUG_PREFIX);

  await Promise.all(
    usersIds.map((userId) => {
      logger.debug(
        `enqueing of users: ${usersIds.length}`,
        undefined,
        DEBUG_PREFIX
      );
      return enqueueTask(AUTOFETCH_POSTS_TASK, { userId });
    })
  );
};

export const autofetchUserPosts = async (req: Request) => {
  logger.debug(`autofetchUserPosts: userId: ${req.data.userId}`);

  const userId = req.data.userId as string;

  if (!userId) {
    throw new Error('userId is required');
  }

  const { postsManager } = createServices();

  try {
    const postsCreated = await postsManager.fetchUser({
      userId,
      params: { expectedAmount: 999 },
    });
    /** once the post is fetch a listner to the DB will trigger the 
      post to be parsed, and autoposted */

    // return for test purposes
    return postsCreated;
  } catch (error: any) {
    /** if hit a rate limit, don't throw and fail the task, otherwise throw */
    if (!error.message.includes('code: 429')) {
      throw error;
    }
    return undefined;
  }
};
