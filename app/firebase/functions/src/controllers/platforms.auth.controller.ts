import { RequestHandler } from 'express';

import { PLATFORM } from '../@shared/types';
import { logger } from '../instances/logger';
import { Services } from '../middleware/services';
import {
  twitterGetSignupContextSchema,
  twitterSignupDataSchema,
} from './auth.schema';
import { getAuthenticatedUser } from './controllers.utils';

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
    const services = (request as any).services as Services;
    const platform = request.params.platform as PLATFORM;

    const userId = getAuthenticatedUser(request);

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterSignupDataSchema.validate(request.body);
      }

      throw new Error(`Unexpected platform ${platform}`);
    })();

    const context = await services.users.handleSignup(
      platform,
      payload,
      userId
    );
    response.status(200).send({ success: true, data: context });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
