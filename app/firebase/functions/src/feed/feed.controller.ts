import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { PostsQuery } from '../@shared/types/types.posts';
import { getServices } from '../controllers.utils';
import { queryParamsSchema } from './feed.schema';

const DEBUG = false;

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getPublicFeedController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await queryParamsSchema.validate(
      request.body
    )) as PostsQuery;

    logger.debug(`${request.path} - query parameters`, { queryParams });

    const services = getServices(request);

    const posts = await services.feed.getFeed(queryParams);

    if (DEBUG) logger.debug(`${request.path}: posts`, { posts });
    response.status(200).send({ success: true, data: posts });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
