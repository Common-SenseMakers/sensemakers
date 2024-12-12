import { Request } from 'firebase-functions/v2/tasks';

import { firestore } from '../..';
import { ALL_SOURCE_PLATFORMS } from '../../@shared/types/types.platforms';
import { getProfileId } from '../../@shared/utils/profiles.utils';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';
import {
  FETCH_ACCOUNT_TASKS,
  FETCH_TASK_DISPATCH_RATES,
} from '../../platforms/platforms.tasks';
import { enqueueTask } from '../../tasksUtils/tasks.support';
import { AutofetchNonUserPostsJobMeta } from './types.posts.tasks';

const DEBUG = true;

export const AUTOFETCH_POSTS_TASK = 'autofetchPosts';

const DEBUG_PREFIX = 'AUTOFETCH';

export const triggerAutofetchPostsForNonUsers = async (services: Services) => {
  if (DEBUG)
    logger.debug(`triggerAutofetchPostsForNonUsers`, undefined, DEBUG_PREFIX);
  const { users } = services;

  const profiles = await users.profiles.getAll();
  const nonUserProfiles = profiles.filter((profile) => !profile.userId);

  ALL_SOURCE_PLATFORMS.forEach(async (platformId) => {
    const nonUserPlatformProfiles = nonUserProfiles.filter(
      (profile) => profile.platformId === platformId
    );
    const fetchPlatformMinPeriod =
      (nonUserPlatformProfiles.length / FETCH_TASK_DISPATCH_RATES[platformId]) *
      1000; // in ms

    const jobLastRun = await (async () => {
      const docId = `${platformId}-autofetchNonUserPosts`;
      const jobMetaDoc = await firestore.collection('jobMeta').doc(docId).get();
      const existingTimestamp = jobMetaDoc.data()?.jobLastRunMs as
        | AutofetchNonUserPostsJobMeta['jobLastRunMs']
        | undefined;
      if (!existingTimestamp) {
        const jobLastRunMs = Date.now();
        await firestore
          .collection('jobMeta')
          .doc(docId)
          .set({ jobLastRunMs } as AutofetchNonUserPostsJobMeta);
        return jobLastRunMs;
      }
      return existingTimestamp as number;
    })();

    if (Date.now() - jobLastRun > fetchPlatformMinPeriod) {
      if (DEBUG)
        logger.debug(
          `Triggering non-user autofetch for ${platformId}`,
          DEBUG_PREFIX
        );

      await firestore
        .collection('jobMeta')
        .doc(`${platformId}-autofetchNonUserPosts`)
        .set({ jobLastRunMs: Date.now() } as AutofetchNonUserPostsJobMeta);

      for (const profile of nonUserPlatformProfiles) {
        // Skip profiles that belong to registered users
        if (profile.userId) {
          continue;
        }

        const profileId = getProfileId(profile.platformId, profile.user_id);

        const taskName = FETCH_ACCOUNT_TASKS[platformId];

        const taskData = {
          profileId,
          platformId,
          amount: 50, // Fetch last 50 posts
          latest: true,
        };

        if (DEBUG)
          logger.debug(
            `Enqueueing fetch task for non-user profile ${profileId}`,
            { taskName, taskData },
            DEBUG_PREFIX
          );
        await enqueueTask(taskName, taskData);
      }
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

export const autofetchUserPosts = async (req: Request, services: Services) => {
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
    return undefined;
  }
};
