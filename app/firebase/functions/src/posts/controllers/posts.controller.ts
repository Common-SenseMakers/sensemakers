import { RequestHandler } from 'express';

import {
  AppPostFull,
  UserPostsQueryParams,
} from '../../@shared/types/types.posts';
import { IS_EMULATOR } from '../../config/config.runtime';
import { envRuntime } from '../../config/typedenv.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { enqueueParseUserPosts } from '../posts.task';
import {
  approvePostSchema,
  createDraftPostSchema,
  getPostSchema,
  getUserPostsQuerySchema,
} from './posts.schema';

const DEBUG = false;

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getUserPostsQuerySchema.validate(
      request.query
    )) as UserPostsQueryParams;
    logger.debug(`${request.path} - query parameters`, { queryParams });
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const posts = await postsManager.getOfUser(userId, queryParams);
    if (DEBUG) logger.debug(`${request.path}: posts`, { posts, userId });
    response.status(200).send({ success: true, data: posts });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

/**
 * fetch users posts and awaits for the fetching operation to finish
 * */
const DEBUG_ENQUEUE = false;

export const fetchUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    if (DEBUG_ENQUEUE)
      logger.debug(`fetch UserPostsController - start`, { userId });

    await postsManager.fetchUser(userId);

    if (DEBUG_ENQUEUE)
      logger.debug(`fetch UserPostsController - done`, { userId });

    const enqueue = enqueueParseUserPosts(
      userId,
      envRuntime.REGION || 'us-central1'
    );

    if (!IS_EMULATOR) {
      if (DEBUG_ENQUEUE)
        logger.debug(`fetch UserPostsController - awaiting enqueue`, {
          userId,
        });
      /** it seems in the enmulator the task exection is synchronous to the http call */
      await enqueue;

      if (DEBUG_ENQUEUE)
        logger.debug(`fetch UserPostsController - enqueue done`);
    }

    logger.debug(`enqueue ParseUserPosts - done`, { userId });

    if (DEBUG) logger.debug(`${request.path}: fetched`, { userId });
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
      if (DEBUG)
        logger.debug(`${request.path}: getPost not authorize`, {
          userId,
          postId: payload.postId,
        });
      response.status(403).send({
        success: false,
        message: 'post are accessible to authors only',
      });
    } else {
      if (DEBUG)
        logger.debug(`${request.path}: getPost ${payload.postId} success`, {
          userId,
          post: post,
        });
      response.status(200).send({ success: true, data: post });
    }
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

export const approvePostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const payload = (await approvePostSchema.validate(
      request.body
    )) as AppPostFull;

    await postsManager.approvePost(payload, userId);

    if (DEBUG)
      logger.debug(`${request.path}: approvePost`, {
        post: payload,
      });

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

export const createDraftPostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const { db, postsManager } = getServices(request);

    const payload = (await createDraftPostSchema.validate(request.body)) as {
      postId: string;
    };

    db.run(async (manager) => {
      return postsManager.processing.createPostDrafts(payload.postId, manager);
    });

    if (DEBUG)
      logger.debug(`${request.path}: approvePost`, {
        post: payload,
      });

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
