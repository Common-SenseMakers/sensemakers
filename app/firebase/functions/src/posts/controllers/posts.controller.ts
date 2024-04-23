import { RequestHandler } from 'express';

import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { getPostSchema } from './posts.schema';

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const posts = await postsManager.getOfUser(userId);
    response.status(200).send({ success: true, posts });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

/**
 * fetch users posts and awaits for the fetching operation to finish
 * */
export const fetchUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    await postsManager.fetchUser(userId);

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

/**
 * trigger parse of unparsed posts (does not wait for parsing to finish)
 * */
export const triggerParseController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    postsManager.parseOfUser(userId);

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

/**
 * get one post from the DB
 * */
export const getPostController: RequestHandler = async (request, response) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const payload = (await getPostSchema.validate(request.body)) as {
      postId: string;
    };

    const post = await postsManager.getPost(payload.postId, true);
    if (post.authorId !== userId) {
      response.status(403).send({
        success: false,
        message: 'post are accessible to authors only',
      });
    } else {
      response.status(200).send({ success: true, post });
    }
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
