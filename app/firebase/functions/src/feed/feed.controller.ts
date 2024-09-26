import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { FeedQueryParams } from '../@shared/types/types.feed';
import { getAuthenticatedUser, getServices } from '../controllers.utils';
import { getFeedSchema } from './feed.schema';

const DEBUG = false;

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getPublicFeedController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getFeedSchema.validate(
      request.body
    )) as FeedQueryParams;

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const userId = getAuthenticatedUser(request, false);
    const { feed } = getServices(request);

    const posts = await feed.getFeed(
      queryParams.fetchParams,
      queryParams.labelsUris
    );

    if (DEBUG) logger.debug(`${request.path}: posts`, { posts, userId });
    response.status(200).send({ success: true, data: posts });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
