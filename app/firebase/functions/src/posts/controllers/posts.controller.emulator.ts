import { RequestHandler } from 'express';

import { logger } from '../../instances/logger';
import { parseUserPostsTask } from '../posts.task';

const DEBUG = true;

/**
 * Controller to test the parseUserPostsTask in the emulator.
 * Calling the task http endpoint from a firebase function fails
 * */
export const parseUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = request.body.userId;
    await parseUserPostsTask({ data: { userId } } as any);
    if (DEBUG) logger.debug(`${request.path}: parseUserPosts`, { userId });
    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
