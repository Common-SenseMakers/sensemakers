import { RequestHandler } from 'express';

import { AddUserDataPayload } from '../../@shared/types/types.fetch';
import { PUBLISHABLE_PLATFORM } from '../../@shared/types/types.platforms';
import {
  GetPostPayload,
  PostUpdatePayload,
  PostsQuery,
} from '../../@shared/types/types.posts';
import { AccountProfileBase } from '../../@shared/types/types.profiles';
import {
  getProfileId,
  parseProfileUrl,
} from '../../@shared/utils/profiles.utils';
import { IS_EMULATOR } from '../../config/config.runtime';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { queryParamsSchema } from '../../feed/feed.schema';
import { logger } from '../../instances/logger';
import { FETCH_ACCOUNT_TASKS } from '../../platforms/platforms.tasks';
import { chunkNumber, enqueueTask } from '../../tasksUtils/tasks.support';
import { canReadPost } from '../posts.access.control';
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';
import {
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

    const payload = (await getPostSchema.validate(
      request.body
    )) as GetPostPayload;

    const config = payload.config || {
      addMirrors: true,
      addAggregatedLabels: true,
    };

    const post = await postsManager.getPost(payload.postId, config, true);

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
    const profileUrls = request.body as string[];
    const parsedProfiles = profileUrls
      .map((profileUrl) => {
        const parsed = parseProfileUrl(profileUrl);
        return parsed;
      })
      .filter((profile) => profile);

    for (const parsedProfile of parsedProfiles) {
      if (!parsedProfile) {
        continue;
      }
      if (DEBUG)
        logger.debug('Fetching profile', {
          platformId: parsedProfile.platformId,
          username: parsedProfile.username,
        });

      let profile: AccountProfileBase | undefined;
      try {
        profile = await services.db.run(async (manager) => {
          return services.users.getOrCreateProfileByUsername(
            parsedProfile.platformId,
            parsedProfile.username,
            manager
          );
        });
      } catch (error) {
        logger.error('error', error);
        continue;
      }

      if (!profile) {
        const error = `unable to find profile for ${parsedProfile.username} on ${parsedProfile.platformId}`;
        logger.error(error);
        continue;
      }

      if (DEBUG) logger.debug('Profile found', { profile });

      /** if this profile has already been fetched, skip it as it will be fetched regularly in a scheduled function */
      if (profile.fetched) {
        continue;
      }

      const profileId = getProfileId(
        parsedProfile.platformId,
        profile?.user_id
      );
      const chunkSize = 50;
      const amount = 10;
      const fetchAmountChunks = chunkNumber(amount, chunkSize);

      for (const fetchAmountChunk of fetchAmountChunks) {
        const taskName =
          FETCH_ACCOUNT_TASKS[parsedProfile.platformId as PUBLISHABLE_PLATFORM];

        const taskData = {
          profileId,
          platformId: parsedProfile.platformId,
          latest: false,
          amount: fetchAmountChunk,
        };

        if (DEBUG) logger.debug('Enqueueing task', { taskName, taskData });
        await enqueueTask(taskName, taskData);
      }
    }

    if (DEBUG)
      logger.debug(`${request.path}: Successfully completed addAccountsData`, {
        totalPayloads: parsedProfiles.length,
      });

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
