import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { getAuthenticatedUser, getServices } from '../../controllers.utils';

export const getLoggedUserController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    const user = await services.db.run((manager) =>
      services.users.getUserProfile(userId, manager)
    );

    response.status(200).send({
      success: true,
      data: user,
    });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
