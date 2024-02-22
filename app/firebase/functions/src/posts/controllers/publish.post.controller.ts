import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { AppPostCreate } from '../../@shared/types';
import { publishPost } from '../posts.service';
import { publishPostsValidationScheme } from './posts.schemas';

export const publishPostController: RequestHandler = async (request, response) => {
  try {
    const userId = (request as any).userId;
    if (!userId) {
      response.status(403).send({});
      return;
    }
    const payload = (await publishPostsValidationScheme.validate(
      request.body
    )) as AppPostCreate;

    const post = await publishPost(userId, payload);

    response.status(200).send({ success: true, post });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
