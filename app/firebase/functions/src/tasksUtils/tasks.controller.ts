import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { getServices } from '../controllers.utils';
import { triggerAutofetchPostsForNonUsers } from '../posts/tasks/posts.autofetch.task';

export const triggerAutofetchNonUsersController: RequestHandler = async (
  request,
  response
) => {
  try {
    logger.debug(`${request.path} - payload`);
    const services = getServices(request);

    await triggerAutofetchPostsForNonUsers(services);

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
