import { RequestHandler } from 'express';

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
