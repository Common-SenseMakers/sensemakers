import { Request } from 'firebase-functions/v2/tasks';

import { PLATFORM } from '../../@shared/types/types.platforms';
import { getProfileId } from '../../@shared/utils/profiles.utils';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';
import {
  FETCH_BLUESKY_ACCOUNT_TASK,
  FETCH_MASTODON_ACCOUNT_TASK,
  FETCH_TWITTER_ACCOUNT_TASK,
} from '../../platforms/platforms.tasks';
import { enqueueTask } from '../../tasksUtils/tasks.support';

export const AUTOFETCH_POSTS_TASK = 'autofetchPosts';

const DEBUG_PREFIX = 'AUTOFETCH';

export const triggerAutofetchPostsForNonUsers = async (services: Services) => {
  logger.debug(`triggerAutofetchPostsForNonUsers`, undefined, DEBUG_PREFIX);
  const { users } = services;

  const profiles = await users.profiles.getAll();
  logger.debug(
    `number of profiles: ${profiles.length}`,
    undefined,
    DEBUG_PREFIX
  );

  for (const profile of profiles) {
    // Skip profiles that belong to registered users
    if (profile.userId) {
      continue;
    }

    const profileId = getProfileId(profile.platformId, profile.user_id);

    let taskName;
    switch (profile.platformId) {
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
        logger.warn(
          `Unsupported platform for autofetch: ${profile.platformId}`,
          undefined,
          DEBUG_PREFIX
        );
        continue;
    }

    const taskData = {
      profileId,
      platformId: profile.platformId,
      amount: 50, // Fetch last 50 posts
      latest: true,
    };

    logger.debug(
      `Enqueueing fetch task for profile ${profileId}`,
      { taskName, taskData },
      DEBUG_PREFIX
    );
    await enqueueTask(taskName, taskData);
  }
};

export const triggerAutofetchPosts = async (services: Services) => {
  logger.debug(`triggerAutofetchPosts`, undefined, DEBUG_PREFIX);
  const { users } = services;

  const usersIds = await users.repo.getAll();

  logger.debug(`number of users: ${usersIds.length}`, undefined, DEBUG_PREFIX);

  await Promise.all(
    usersIds.map((userId) => {
      logger.debug(
        `enqueing of users: ${usersIds.length}`,
        undefined,
        DEBUG_PREFIX
      );
      return (enqueueTask as any)(AUTOFETCH_POSTS_TASK, { userId }, services);
    })
  );
};

export const autofetchUserPosts = async (req: Request, services: Services) => {
  logger.debug(`autofetchUserPosts: userId: ${req.data.userId}`);

  const userId = req.data.userId as string;

  if (!userId) {
    throw new Error('userId is required');
  }

  const { postsManager } = services;

  try {
    const postsCreated = await postsManager.fetchUser({
      userId,
      params: { expectedAmount: 999 },
    });
    /** once the post is fetch a listner to the DB will trigger the 
      post to be parsed, and autoposted */

    // return for test purposes
    return postsCreated;
  } catch (error: any) {
    /** if hit a rate limit, don't throw and fail the task, otherwise throw */
    if (!error.message.includes('code: 429')) {
      throw error;
    }
    return undefined;
  }
};
