import { Request } from 'firebase-functions/v2/tasks';

import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';

export const TRIGGER_AUTOFETCH_POSTS_TASK = 'triggerAutofetchPosts';
export const AUTOFETCH_POSTS_TASK = 'autofetchPosts';

export const triggerAutofetchPosts = async () => {
  logger.debug(`triggerAutofetchPosts`);
  const { postsManager } = createServices();
  await postsManager.triggerAutofetchPosts();
};

export const autofetchUserPosts = async (req: Request) => {
  logger.debug(`autofetchUserPosts: userId: ${req.data.userId}`);
  const userId = req.data.userId;
  const { postsManager } = createServices();
  await postsManager.fetchUser(userId);
  /** once the post is fetch a listner to the DB will trigger the 
  post to be parsed, and autoposted */
};
