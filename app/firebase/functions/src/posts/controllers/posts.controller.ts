import { RequestHandler } from 'express';

import { AddUserDataPayload } from '../../@shared/types/types.fetch';
import { PLATFORM } from '../../@shared/types/types.platforms';
import { PostUpdatePayload, PostsQuery } from '../../@shared/types/types.posts';
import { AccountProfileBase } from '../../@shared/types/types.profiles';
import { IS_EMULATOR } from '../../config/config.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { queryParamsSchema } from '../../feed/feed.schema';
import { logger } from '../../instances/logger';
import {
  FETCH_BLUESKY_ACCOUNT_TASK,
  FETCH_MASTODON_ACCOUNT_TASK,
  FETCH_TWITTER_ACCOUNT_TASK,
} from '../../platforms/platforms.tasks';
import { getProfileId } from '../../profiles/profiles.repository';
import { chunkNumber, enqueueTask } from '../../tasksUtils/tasks.support';
import { canReadPost } from '../posts.access.control';
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';
import { postIdValidation, updatePostSchema } from './posts.schema';

const DEBUG = true;

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

export const addAccountsDataController: RequestHandler = async (
  request,
  response
) => {
  try {
    if (DEBUG)
      logger.debug(`${request.path}: Starting addAccountsDataController`, {
        payloads: request.body,
      });

    const services = getServices(request);
    const payloads = request.body as AddUserDataPayload[];

    for (const payload of payloads) {
      if (DEBUG)
        logger.debug('Fetching profile', {
          platformId: payload.platformId,
          username: payload.username,
        });

      let profile: AccountProfileBase | undefined;
      try {
        profile = await services.db.run(async (manager) => {
          return services.users.getOrCreateProfileByUsername(
            payload.platformId,
            payload.username,
            manager
          );
        });
      } catch (error) {
        logger.error('error', error);
        continue;
      }

      if (!profile) {
        const error = `unable to find profile for ${payload.username} on ${payload.platformId}`;
        logger.error(error);
        continue;
      }

      if (DEBUG) logger.debug('Profile found', { profile });

      const profileId = getProfileId(payload.platformId, profile?.user_id);
      const chunkSize = 50;
      const fetchAmountChunks = chunkNumber(payload.amount, chunkSize);

      for (const fetchAmountChunk of fetchAmountChunks) {
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

        const taskData = {
          profileId,
          platformId: payload.platformId,
          latest: payload.latest,
          amount: fetchAmountChunk,
        };

        if (DEBUG) logger.debug('Enqueueing task', { taskName, taskData });
        await enqueueTask(taskName, taskData);
      }
    }

    if (DEBUG)
      logger.debug(`${request.path}: Successfully completed addAccountsData`, {
        totalPayloads: payloads.length,
      });

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
