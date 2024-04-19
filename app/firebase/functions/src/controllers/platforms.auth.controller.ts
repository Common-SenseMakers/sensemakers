import { RequestHandler } from 'express';

import { PLATFORM } from '../@shared/types/types';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import {
  twitterGetSignupContextSchema,
  twitterSignupDataSchema,
} from './auth.schema';
import { getAuthenticatedUser, getServices } from './controllers.utils';

export const getSignupContextController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request);
    const services = (request as any).services as Services;
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