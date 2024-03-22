import { RequestHandler } from 'express';

import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { NODE_ENV } from '../config/config.runtime';
import { getServices } from '../controllers/controllers.utils';
import { logger } from '../instances/logger';

export const authenticate: RequestHandler = async (request, response, next) => {
  if (!request.headers.authorization) {
    logger.debug('Unauthenticated request');
    return next();
  }

  try {
    const services = getServices(request);
    const parts = request.headers.authorization.split(' ');

    // TODO: maybe this should be removed and use mocks?
    if (NODE_ENV === ENVIRONMENTS.TEST) {
      (request as any).userId = parts.length > 1 ? parts[1] : '';
      return next();
    }

    const token = parts[1];
    logger.debug(`Authentica request token: ${token.slice(0, 12)}`);
    const userId = services.users.verifyAccessToken(token);

    logger.debug(`Authenticated user: ${userId}`);

    (request as any).userId = userId;

    return next();
  } catch (error: any) {
    logger.error(`error ${JSON.stringify(error)}`);
    response.status(500).send({ success: false, error: error.message });
  }
};
