import { RequestHandler } from 'express';

import { UserSettingsUpdate } from '../../@shared/types/types.user';
import {
  getAuthenticatedClerkUser,
  getAuthenticatedUser,
  getServices,
} from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { userSettingsUpdateSchema } from './auth.schema';

export const getLoggedUserController: RequestHandler = async (
  request,
  response
) => {
  try {
    const services = getServices(request);

    const user = await services.db.run(async (manager) => {
      const userId = await (async () => {
        /**
         * if the clerkuser exist, return that userId, otherwise
         * here es where we create a new user in the DB
         */
        const existingUserId = await getAuthenticatedUser(
          request,
          services.users,
          manager
        );

        if (existingUserId) return existingUserId;

        const clerkId = getAuthenticatedClerkUser(request, true);
        return services.users.createUser(clerkId, manager);
      })();

      return services.users.getLoggedUserWithProfiles(userId, manager);
    });

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
    const services = getServices(request);

    const settingsUpdate = (await userSettingsUpdateSchema.validate(
      request.body
    )) as UserSettingsUpdate;

    await services.db.run(async (manager) => {
      const userId = await getAuthenticatedUser(
        request,
        services.users,
        manager,
        true
      );
      await services.users.updateSettings(userId, settingsUpdate, manager);
    });

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
    const services = getServices(request);

    await services.db.run(async (manager) => {
      const userId = await getAuthenticatedUser(
        request,
        services.users,
        manager,
        true
      );
      await services.users.setOnboarded(userId, manager);
    });

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
