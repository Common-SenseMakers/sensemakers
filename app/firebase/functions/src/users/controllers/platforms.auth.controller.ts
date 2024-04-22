import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { PLATFORM } from '../../@shared/types/types';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import {
  twitterGetSignupContextSchema,
  twitterSignupDataSchema,
} from './auth.schema';

export const getSignupContextController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request);
    const services = getServices(request);

    const platform = request.params.platform as PLATFORM;

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterGetSignupContextSchema.validate(request.body);
      }

      throw new Error(`Unexpected platform ${platform}`);
    })();

    const context = await services.users.getSignupContext(
      platform,
      userId,
      payload
    );

    response.status(200).send({ success: true, data: context });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

export const handleSignupController: RequestHandler = async (
  request,
  response
) => {
  try {
    const platform = request.params.platform as PLATFORM;

    const services = getServices(request);
    const userId = getAuthenticatedUser(request);

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterSignupDataSchema.validate(request.body);
      }

      throw new Error(`Unexpected platform ${platform}`);
    })();

    const result = await services.db.run((manager) =>
      services.users.handleSignup(platform, payload, manager, userId)
    );

    response.status(200).send({ success: true, data: result });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
