import { RequestHandler } from 'express';

import {
  AppPostFull,
  PostUpdatePayload,
  UserPostsQuery,
  ProfilePostsQuery
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
  getUserProfileSchema,
  postIdValidation,
  updatePostSchema,
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
      request.body
    )) as UserPostsQuery;

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const posts = await postsManager.getOfUser(userId, queryParams);

    if (DEBUG) logger.debug(`${request.path}: posts`, { posts, userId });
    response.status(200).send({ success: true, data: posts });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};


/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getUserProfileController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getUserProfileSchema.validate(
      request.body
    )) as ProfilePostsQuery;

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const { postsManager } = getServices(request);

    const posts = await postsManager.getUserProfile(queryParams.platformId, queryParams.username, queryParams.fetchParams, queryParams.labelsUris);
    if (DEBUG) logger.debug(`${request.path}: posts`, { posts });

    response.status(200).send({ success: true, data: posts });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
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
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
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
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
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
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
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

    if (DEBUG)
      logger.debug(`${request.path}: createDraftPostController`, {
        payload,
      });

    db.run(async (manager) => {
      return postsManager.processing.createOrUpdatePostDrafts(
        payload.postId,
        manager
      );
    });

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};

export const updatePostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { db, postsManager } = getServices(request);

    const payload = (await updatePostSchema.validate(
      request.body
    )) as PostUpdatePayload;

    db.run(async (manager) => {
      const post = await postsManager.processing.posts.get(
        payload.postId,
        manager,
        true
      );

      if (post.authorId !== userId) {
        throw new Error(`Post can only be edited by the author`);
      }

      return postsManager.updatePost(
        payload.postId,
        payload.postUpdate,
        manager
      );
    });

    if (DEBUG) logger.debug(`${request.path}: updatePost`, payload);

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
