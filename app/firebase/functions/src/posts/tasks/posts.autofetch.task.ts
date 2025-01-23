import {
  ALL_SOURCE_PLATFORMS,
  IDENTITY_PLATFORM,
} from '../../@shared/types/types.platforms';
import { FetchPlatfomAccountTaskData } from '../../@shared/types/types.profiles';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';
import {
  FETCH_ACCOUNT_TASKS,
  FETCH_TASK_DISPATCH_RATES,
} from '../../platforms/platforms.tasks.config';
import { enqueueTask } from '../../tasksUtils/tasks.support';
import { AutofetchNonUserPostsJobMeta } from './types.posts.tasks';

const DEBUG = false;

export const AUTOFETCH_POSTS_TASK = 'autofetchPosts';

const DEBUG_PREFIX = 'AUTOFETCH';

export const triggerAutofetchPostsForNonUsers = async (services: Services) => {
  if (DEBUG)
    logger.debug(`triggerAutofetchPostsForNonUsers`, undefined, DEBUG_PREFIX);
  const { users, db, profiles } = services;

  ALL_SOURCE_PLATFORMS.forEach(async (platformId) => {
    if (DEBUG)
      logger.debug(
        `Starting non-user autofetch for ${platformId}`,
        DEBUG_PREFIX
      );

    const profilesIds = await users.profiles.repo.getMany({
      autofetch: true,
      platformId: platformId as IDENTITY_PLATFORM,
      userIdDefined: false,
    });

    if (DEBUG)
      logger.debug(`Profiles found: ${profilesIds.length}`, DEBUG_PREFIX);

    const fetchPlatformMinPeriod =
      (profilesIds.length / FETCH_TASK_DISPATCH_RATES[platformId]) * 1000; // in ms

    const jobLastRun = await (async () => {
      const docId = `${platformId}-autofetchNonUserPosts`;
      const jobMetaDoc = await services.db.firestore
        .collection('jobMeta')
        .doc(docId)
        .get();
      const existingTimestamp = jobMetaDoc.data()?.jobLastRunMs as
        | AutofetchNonUserPostsJobMeta['jobLastRunMs']
        | undefined;
      if (!existingTimestamp) {
        const jobLastRunMs = Date.now();
        await services.db.firestore
          .collection('jobMeta')
          .doc(docId)
          .set({ jobLastRunMs } as AutofetchNonUserPostsJobMeta);
        return jobLastRunMs;
      }
      return existingTimestamp as number;
    })();

    const now = services.time.now();

    if (DEBUG)
      logger.debug(
        `Checking rate limit for ${platformId}`,
        { now, jobLastRun, fetchPlatformMinPeriod },
        DEBUG_PREFIX
      );

    if (now - jobLastRun > fetchPlatformMinPeriod) {
      if (DEBUG)
        logger.debug(
          `Triggering non-user autofetch for ${platformId}`,
          { now, profilesIds },
          DEBUG_PREFIX
        );

      await services.db.firestore
        .collection('jobMeta')
        .doc(`${platformId}-autofetchNonUserPosts`)
        .set({ jobLastRunMs: now } as AutofetchNonUserPostsJobMeta);

      for (const profileId of profilesIds) {
        // Skip profiles that belong to registered users
        const profile = await db.run((manager) =>
          profiles.repo.getByProfileId(profileId, manager, true)
        );

        if (profile.userId) {
          continue;
        }

        const taskName = FETCH_ACCOUNT_TASKS[platformId];

        const taskData: FetchPlatfomAccountTaskData = {
          profileId,
          amount: 50, // Fetch last 50 posts
          latest: true,
        };

        if (DEBUG)
          logger.debug(
            `Enqueueing fetch task for non-user profile ${profileId}`,
            { taskName, taskData },
            DEBUG_PREFIX
          );
        await enqueueTask(taskName, taskData, services);
      }
    } else {
      if (DEBUG)
        logger.debug(
          `Skipping non-user autofetch for ${platformId}`,
          { now, jobLastRun, fetchPlatformMinPeriod },
          DEBUG_PREFIX
        );
    }
  });
};

export const triggerAutofetchPosts = async (services: Services) => {
  if (DEBUG) logger.debug(`triggerAutofetchPosts`, undefined, DEBUG_PREFIX);
  const { users } = services;

  const usersIds = await users.repo.getAll();

  if (DEBUG)
    logger.debug(
      `number of users: ${usersIds.length}`,
      undefined,
      DEBUG_PREFIX
    );

  await Promise.all(
    usersIds.map((userId) => {
      if (DEBUG)
        logger.debug(
          `enqueing of users: ${usersIds.length}`,
          undefined,
          DEBUG_PREFIX
        );
      return (enqueueTask as any)(AUTOFETCH_POSTS_TASK, { userId }, services);
    })
  );
};

export const autofetchUserPosts = async (
  req: { data: { userId: string } },
  services: Services
) => {
  if (DEBUG) logger.debug(`autofetchUserPosts: userId: ${req.data.userId}`);

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
    logger.warn(`Rate limit hit for user ${userId}`);
    return undefined;
  }
};
