import { RequestHandler } from 'express';

import { PLATFORM } from '../@shared/types';
import { logger } from '../instances/logger';
import { Services } from '../middleware/services';

export const getSignupContextController: RequestHandler = async (
  request,
  response
) => {
  try {
    const services = (request as any).services as Services;
    const platform = request.params.platform as PLATFORM;
    const context = await services.users.getSignupContext(platform);
    response.status(200).send({ success: true, context });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
