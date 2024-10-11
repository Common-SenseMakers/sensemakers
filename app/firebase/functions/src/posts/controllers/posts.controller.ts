import { RequestHandler } from 'express';

import {
  AddUserDataPayload,
  FetchParams,
} from '../../@shared/types/types.fetch';
import { PublishPostPayload } from '../../@shared/types/types.fetch';
import {
  PostUpdatePayload,
  PostsQuery,
  UnpublishPlatformPostPayload,
} from '../../@shared/types/types.posts';
import { IS_EMULATOR } from '../../config/config.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { enqueueTask } from '../../tasksUtils/tasks.support';
import { canReadPost } from '../posts.access.control';
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';
import {
  approvePostSchema,
  createDraftPostSchema,
  getUserPostsQuerySchema,
  postIdValidation,
  retractPostSchema,
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
    )) as PostsQuery;

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const posts = await postsManager.getOfUser({ ...queryParams, userId });

    if (DEBUG) logger.debug(`${request.path}: posts`, { posts, userId });
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
    const userId = getAuthenticatedUser(request);
    const { postsManager } = getServices(request);

    const payload = (await postIdValidation.validate(request.body)) as {
      postId: string;
    };

    const post = await postsManager.getPost(payload.postId, true);

    const canRead = canReadPost(post, userId);

    if (!canRead) {
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
    )) as PublishPostPayload;

    await postsManager.publishPost(
      payload.post,
      payload.platformIds,
      undefined,
      false,
      userId
    );

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

    const task = enqueueTask(PARSE_POST_TASK, { postId: payload.postId });

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

      if (post.authorUserId !== userId) {
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

export const unpublishPlatformPostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request, true);
    const { postsManager } = getServices(request);

    const payload = (await retractPostSchema.validate(
      request.body
    )) as UnpublishPlatformPostPayload;

    await postsManager.unpublishPlatformPost(
      payload.postId,
      userId,
      payload.platformId,
      payload.post_id
    );

    if (DEBUG) logger.debug(`${request.path}: updatePost`, payload);

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

export const addAccountDataController: RequestHandler = async (
  request,
  response
) => {
  try {
    const services = getServices(request);

    const payload = request.body as AddUserDataPayload;

    const profile = await services.db.run(async (manager) => {
      return services.users.getOrCreateProfileByUsername(
        payload.platformId,
        payload.username,
        manager
      );
    });

    if (!profile) {
      throw new Error(
        `unable to find profile for ${payload.username} on ${payload.platformId}`
      );
    }
    /** the value of sinceId or untilId doesn't matter, as long as it exists, then it will be converted to appropriate fetch params */
    const fetchParams: FetchParams = payload.latest
      ? { expectedAmount: payload.amount, sinceId: profile.user_id }
      : { expectedAmount: payload.amount, untilId: profile.user_id };

    const fetchedPosts = await services.db.run(async (manager) => {
      return services.postsManager.fetchAccount(
        payload.platformId,
        profile?.user_id,
        fetchParams,
        manager
      );
    });

    if (DEBUG) logger.debug(`${request.path}: addAccountData`, payload);

    response.status(200).send({ success: true, data: fetchedPosts });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
