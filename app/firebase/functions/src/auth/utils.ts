import { Request, Response } from 'express';
import { logger } from 'firebase-functions/v1';

export const validateUser = (request: Request, response: Response) => {
  const userId = (request as any).userId;
  if (!userId) {
    logger.error('user not authenticated');
    response.status(403).send({});
  }
  return userId;
};
