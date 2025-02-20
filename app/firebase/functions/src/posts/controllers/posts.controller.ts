import { RequestHandler } from 'express';

import {
  GetIndexedEntries,
  GetPostPayload,
  PostUpdatePayload,
  PostsQuery,
} from '../../@shared/types/types.posts';
import { CollectionNames } from '../../@shared/utils/collectionNames';
import { IS_EMULATOR } from '../../config/config.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { queryParamsSchema } from '../../feed/feed.schema';
import { logger } from '../../instances/logger';
import { TASK } from '../../tasks/types.tasks';
import { IndexedPostsRepo } from '../indexed.posts.repository';
import {
  getKeywordsSchema,
  getPostSchema,
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
    const queryParams = (await queryParamsSchema.validate(
      request.body
    )) as PostsQuery;

    logger.debug(`${request.path} - query parameters`, { queryParams });

    const services = getServices(request);
    const userId = await services.db.run(async (manager) => {
      return getAuthenticatedUser(request, services.users, manager, true);
    });

    const posts = await services.postsManager.getOfUser({
      ...queryParams,
      userId,
    });

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
    const services = getServices(request);

    const payload = (await getPostSchema.validate(
      request.body
    )) as GetPostPayload;

    const config = payload.config || {
      addMirrors: true,
      addAggregatedLabels: true,
    };

    const post = await services.postsManager.getPost(
      payload.postId,
      config,
      true
    );

    if (DEBUG)
      logger.debug(`${request.path}: getPost ${payload.postId} success`, {
        post: post,
      });
    response.status(200).send({ success: true, data: post });
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

    const services = getServices(request);
    const task = services.tasks.enqueue(TASK.PARSE_POST, {
      postId: payload.postId,
      undefined,
      services,
    });

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

export const updatePostController: RequestHandler = async (
  request,
  response
) => {
  try {
    const services = getServices(request);

    const payload = (await updatePostSchema.validate(
      request.body
    )) as PostUpdatePayload;

    await services.db.run(async (manager) => {
      const userId = await getAuthenticatedUser(
        request,
        services.users,
        manager,
        true
      );

      const post = await services.postsManager.processing.posts.get(
        payload.postId,
        manager,
        true
      );

      if (post.authorUserId !== userId) {
        throw new Error(`Post can only be edited by the author`);
      }

      return services.postsManager.updatePost(
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

export const getKeywordsController: RequestHandler = async (
  request,
  response
) => {
  try {
    const services = getServices(request);

    const payload = (await getKeywordsSchema.validate(
      request.body
    )) as GetIndexedEntries;

    const cluster = services.clusters.getInstance(payload.clusterId);
    const indexedRepo = new IndexedPostsRepo(
      cluster.collection(CollectionNames.Keywords)
    );
    const keywords = await indexedRepo.getManyEntries({
      expectedAmount: 10,
      untilId: payload.afterId,
    });

    if (DEBUG) logger.debug(`${request.path}: updatePost`, payload);

    response.status(200).send({ success: true, data: keywords });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
