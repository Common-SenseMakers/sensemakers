import { RequestHandler } from 'express';

import {
  AppPostFull,
  PostUpdate,
  UserPostsQueryParams,
} from '../../@shared/types/types.posts';
import { IS_EMULATOR } from '../../config/config.runtime';
import { envRuntime } from '../../config/typedenv.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { enqueueParsePost } from '../posts.task';
import {
  approvePostSchema,
  createDraftPostSchema,
  getUserPostsQuerySchema,
  postIdValidation,
  updatePostSchema,
} from './posts.schema';

const DEBUG = true;

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getUserPostsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getUserPostsQuerySchema.validate(
      request.body
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
 * get one post from the DB
 * */
export const getPostController: RequestHandler = async (request, response) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const payload = (await postIdValidation.validate(request.body)) as {
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

export const parsePostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const payload = (await postIdValidation.validate(request.body)) as {
      postId: string;
    };

    const task = enqueueParsePost(
      payload.postId,
      envRuntime.REGION || 'us-central1'
    );

    if (!IS_EMULATOR) {
      // can await if not emulator
      await task;
    }

    if (DEBUG)
      logger.debug(`${request.path}: parsePost: ${payload.postId}`, {
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

export const updatePostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const { db, postsManager } = getServices(request);

    const payload = (await updatePostSchema.validate(request.body)) as {
      postId: string;
      post: PostUpdate;
    };

    db.run(async (manager) => {
      return postsManager.processing.posts.updateContent(
        payload.postId,
        payload.post,
        manager
      );
    });

    if (DEBUG)
      logger.debug(`${request.path}: updatePost`, {
        post: payload,
      });

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
