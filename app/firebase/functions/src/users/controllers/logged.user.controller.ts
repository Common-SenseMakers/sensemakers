import { RequestHandler } from 'express';

import { UserSettingsUpdate } from '../../@shared/types/types.user';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { userSettingsUpdateSchema } from './auth.schema';

export const getLoggedUserController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    const user = await services.db.run((manager) =>
      services.users.getLoggedUserWithProfiles(userId, manager)
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

export const setUserSettingsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    const settingsUpdate = (await userSettingsUpdateSchema.validate(
      request.body
    )) as UserSettingsUpdate;

    await services.users.updateSettings(userId, settingsUpdate);

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};

export const setUserOnboardedController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    await services.users.setOnboarded(userId);

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
