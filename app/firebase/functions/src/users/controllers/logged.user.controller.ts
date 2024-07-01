import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { UserSettingsUpdate } from '../../@shared/types/types.user';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { emailUpdateSchema, userSettingsUpdateSchema } from './auth.schema';

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

export const setUserEmail: RequestHandler = async (request, response) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    const emailUpdate = (await emailUpdateSchema.validate(request.body)) as {
      email: string;
    };

    await services.users.setEmail(userId, emailUpdate.email);

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
