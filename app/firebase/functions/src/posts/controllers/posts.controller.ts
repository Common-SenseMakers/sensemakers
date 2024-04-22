import { RequestHandler } from 'express';

import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';

export const fetchUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const posts = await postsManager.getPendingOfUser(userId);
    response.status(200).send({ success: true, posts });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
