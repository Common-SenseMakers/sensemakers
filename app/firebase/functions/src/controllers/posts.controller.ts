import { RequestHandler } from 'express';

import { AppUser } from '../@shared/types/types';
import { logger } from '../instances/logger';
import { getAuthenticatedUser, getServices } from './controllers.utils';

export const fetchUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager, users, db } = getServices(request);

    await db.run(async (manager) => {
      const user = await users.repo.getUser(userId, manager);
      if (user === undefined) {
        response.status(404).send({ success: false, error: 'User not found' });
      }
      await postsManager.fetchUser(user as AppUser);
      response.status(200).send({ success: true });
    });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
