import { Magic } from '@magic-sdk/admin';
import { RequestHandler } from 'express';

import { UserSettingsUpdate } from '../../@shared/types/types.user';
import { MAGIC_ADMIN_SECRET } from '../../config/config.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { magicEmailSetSchema, userSettingsUpdateSchema } from './auth.schema';

export const getLoggedUserController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    const user = await services.db.run((manager) =>
      services.users.getUserWithProfiles(userId, manager)
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

export const setUserEmailMagic: RequestHandler = async (request, response) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const services = getServices(request);

    const emailUpdate = (await magicEmailSetSchema.validate(request.body)) as {
      idToken: string;
    };

    const magic = await Magic.init(MAGIC_ADMIN_SECRET.value());
    await services.users.setEmailFromMagic(userId, emailUpdate.idToken, magic);

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
