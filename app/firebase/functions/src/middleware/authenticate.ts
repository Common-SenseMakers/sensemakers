import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { verifyAccessToken } from '../auth/controllers/utils';
import { IS_TEST } from '../config/config';

export const authenticate: RequestHandler = async (request, response, next) => {
  if (!request.headers.authorization) {
    logger.debug('Unauthenticated request');
    return next();
  }

  try {
    const parts = request.headers.authorization.split(' ');
    
    if (IS_TEST) {
      (request as any).userId = parts.length > 1 ? parts[1] : '';
      return next();
    }

    const token = parts[1];
    logger.debug(`Authentica request token: ${token.slice(0,12)}`);
    const userId = verifyAccessToken(token);
    
    logger.debug(`Authenticated user: ${userId}`);

    (request as any).userId = userId;

    return next();
  } catch (error: any) {
    logger.error(`error ${JSON.stringify(error)}`);
    response.status(500).send({ success: false, error: error.message });
  }
};
