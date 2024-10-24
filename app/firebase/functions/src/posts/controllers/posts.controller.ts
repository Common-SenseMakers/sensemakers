import { RequestHandler } from 'express';

import { AddUserDataPayload } from '../../@shared/types/types.fetch';
import { PublishPostPayload } from '../../@shared/types/types.fetch';
import { PLATFORM } from '../../@shared/types/types.platforms';
import {
  PostUpdatePayload,
  PostsQuery,
  UnpublishPlatformPostPayload,
} from '../../@shared/types/types.posts';
import { IS_EMULATOR } from '../../config/config.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import {
  FETCH_BLUESKY_ACCOUNT_TASK,
  FETCH_MASTODON_ACCOUNT_TASK,
  FETCH_TWITTER_ACCOUNT_TASK,
} from '../../platforms/platforms.tasks';
import { getProfileId } from '../../profiles/profiles.repository';
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
    const profileId = getProfileId(payload.platformId, profile?.user_id);
    if (payload.platformId === PLATFORM.Twitter) {
      await enqueueTask(FETCH_TWITTER_ACCOUNT_TASK, {
        profileId,
        platformId: PLATFORM.Twitter,
        latest: payload.latest,
        amount: payload.amount,
      });
    }
    if (payload.platformId === PLATFORM.Mastodon) {
      await enqueueTask(FETCH_MASTODON_ACCOUNT_TASK, {
        profileId,
        platformId: PLATFORM.Mastodon,
        latest: payload.latest,
        amount: payload.amount,
      });
    }
    if (payload.platformId === PLATFORM.Bluesky) {
      await enqueueTask(FETCH_BLUESKY_ACCOUNT_TASK, {
        profileId,
        platformId: PLATFORM.Bluesky,
        latest: payload.latest,
        amount: payload.amount,
      });
    }

    if (DEBUG) logger.debug(`${request.path}: addAccountData`, payload);

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

export const addAccountsDataController: RequestHandler = async (
  request,
  response
) => {
  try {
    const services = getServices(request);
    const payloads = request.body as AddUserDataPayload[];

    for (const payload of payloads) {
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

      const profileId = getProfileId(payload.platformId, profile?.user_id);
      const chunkSize = 100;
      const chunks = Math.ceil(payload.amount / chunkSize);

      for (let i = 0; i < chunks; i++) {
        const amount = Math.min(chunkSize, payload.amount - i * chunkSize);
        const latest = i === 0 ? payload.latest : undefined;

        let taskName;
        switch (payload.platformId) {
          case PLATFORM.Twitter:
            taskName = FETCH_TWITTER_ACCOUNT_TASK;
            break;
          case PLATFORM.Mastodon:
            taskName = FETCH_MASTODON_ACCOUNT_TASK;
            break;
          case PLATFORM.Bluesky:
            taskName = FETCH_BLUESKY_ACCOUNT_TASK;
            break;
          default:
            throw new Error(`Unsupported platform: ${payload.platformId}`);
        }

        await enqueueTask(taskName, {
          profileId,
          platformId: payload.platformId,
          latest,
          amount,
        });
      }
    }

    if (DEBUG) logger.debug(`${request.path}: addAccountsData`, payloads);

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
