import { RequestHandler } from 'express';

import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { ADMIN_API_KEY, NODE_ENV } from '../config/config.runtime';
import { getServices } from '../controllers.utils';
import { logger } from '../instances/logger';

export const authenticate: RequestHandler = async (request, response, next) => {
  if (!request.headers.authorization) {
    logger.debug(`${request.path}: Unauthenticated request`);
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
    const userId = services.users.verifyAccessToken(token);

    logger.debug(`${request.path}: Authenticated user`, {
      userId,
      token06: token.slice(0, 6),
    });

    (request as any).userId = userId;

    return next();
  } catch (error: any) {
    logger.error(`error ${JSON.stringify(error)}`);
    response.status(500).send({ success: false, error: error.message });
  }
};

export const authenticateAdmin: RequestHandler = async (
  request,
  response,
  next
) => {
  if (!request.headers['admin-api-key']) {
    logger.debug(
      `${request.path}: Unauthorized admin request, missing admin key`
    );
    return response
      .status(403)
      .send({ success: false, error: 'Admin key required' });
  }

  try {
    const adminKey = request.headers['admin-api-key'] as string;

    // In the test environment, bypass admin key validation
    if (NODE_ENV === ENVIRONMENTS.TEST) {
      logger.debug(
        `${request.path}: Skipping admin key validation in test environment`
      );
      (request as any).admin = true;
      return next();
    }

    // Check if the provided admin key matches the expected value
    const expectedAdminKey = ADMIN_API_KEY.value();
    if (adminKey !== expectedAdminKey) {
      logger.debug(`${request.path}: Invalid admin key`);
      return response
        .status(403)
        .send({ success: false, error: 'Invalid admin key' });
    }

    logger.debug(`${request.path}: Admin authenticated`);

    // Set a flag or admin info in the request object to be used later in the request lifecycle
    (request as any).admin = true;

    return next();
  } catch (error: any) {
    logger.error(`Error in authenticateAdmin: ${error.message}`);
    response.status(500).send({ success: false, error: error.message });
  }
};
