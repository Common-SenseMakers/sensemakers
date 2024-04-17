import { RequestHandler } from 'express';
import { AppUser } from 'src/@shared/types/types';

import { AppPostMirror } from '../@shared/types.posts';
import { logger } from '../instances/logger';
import { mirrorPostSchema } from './auth.schema';
import { getAuthenticatedUser, getServices } from './controllers.utils';

export const mirrorPostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    const payload = (await mirrorPostSchema.validate(
      request.body
    )) as AppPostMirror;

    const context = await services.posts.mirror(userId, payload);

    response.status(200).send({ success: true, data: context });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

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
