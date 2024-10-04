import {
  ActivityEventBase,
  ActivityEventCreate,
  ActivityType,
  PostActData,
} from '../../@shared/types/types.activity';
import {
  AppPost,
  AppPostParsedStatus,
  AppPostRepublishedStatus,
} from '../../@shared/types/types.posts';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';
import { enqueueTask } from '../../tasksUtils/tasks.support';
import { UsersHelper } from '../../users/users.helper';
import { AUTOPOST_POST_TASK } from '../tasks/posts.autopost.task';
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';

const PREFIX = 'POST-UPDATED-HOOK';
const DEBUG = false;

// TODO: change interface to receive post as the after value and also send the previous one
export const postUpdatedHook = async (
  post: AppPost,
  services: Services,
  postBefore?: AppPost
) => {
  const postId = post.id;

  const { db, time, activity, users } = services;

  /** Frontend watcher to react to changes in real-time */
  const updateRef = db.collections.updates.doc(`post-${postId}`);
  const now = time.now();

  if (DEBUG)
    logger.debug(`postUpdatedHook post-${postId}-${now}`, undefined, PREFIX);

  await db.run(
    async (manager) => {
      manager.set(updateRef, { value: now });
    },
    undefined,
    undefined,
    `postUpdatedHook - ref ${postId}`
  );

  /** Handle post create */
  if (postBefore === undefined) {
    // trigger parsePostTask
    if (DEBUG) logger.debug(`triggerTask ${PARSE_POST_TASK}-${postId}`);
    await enqueueTask(PARSE_POST_TASK, { postId });
  }

  const activitiesCreated: ActivityEventBase[] = [];

  /** Create the activity elements */
  const { wasParsed } = await db.run(
    async (manager) => {
      /** detect parsed state change */
      const wasParsed =
        postBefore &&
        postBefore.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
        post.parsedStatus === AppPostParsedStatus.PROCESSED;

      if (wasParsed) {
        if (DEBUG)
          logger.debug(
            `wasParsed ${PARSE_POST_TASK}-${postId}`,
            undefined,
            PREFIX
          );
        const event: ActivityEventCreate<PostActData> = {
          type: ActivityType.PostParsed,
          data: {
            postId: post.id,
          },
          timestamp: time.now(),
        };

        const parsedActivity = activity.repo.create(event, manager);
        activitiesCreated.push(parsedActivity);
      }

      // if was parsed and user has autopost, then also trigger autopost
      const wasAutoposted =
        postBefore &&
        postBefore.republishedStatus === AppPostRepublishedStatus.PENDING &&
        post.republishedStatus !== AppPostRepublishedStatus.PENDING;

      if (wasAutoposted) {
        if (DEBUG)
          logger.debug(
            `wasAutoposted ${PARSE_POST_TASK}-${postId}`,
            undefined,
            PREFIX
          );
        const event: ActivityEventCreate<PostActData> = {
          type: ActivityType.PostAutoposted,
          data: {
            postId: post.id,
          },
          timestamp: time.now(),
        };

        const autopostedActivity = activity.repo.create(event, manager);
        activitiesCreated.push(autopostedActivity);
      }

      if (DEBUG)
        logger.debug(
          `postUpdatedHook -${postId}`,
          {
            post,
            wasAutoposted,
            wasParsed,
          },
          PREFIX
        );

      return { wasParsed };
    },
    undefined,
    undefined,
    `postUpdatedHook - wasParsed - wasAutoposted ${postId}`
  );

  /** trigger Autopost*/
  if (wasParsed) {
    const author = await db.run(async (manager) => {
      return post.authorUserId
        ? users.repo.getUser(post.authorUserId, manager, true)
        : undefined;
    });

    if (author) {
      /** autopost when parsed, author has autopost enabled, and post detected as research using deterministic approach */
      const autopostOnPlatforms = UsersHelper.getAutopostPlatformIds(
        author,
        post
      );

      if (autopostOnPlatforms.length > 0) {
        if (DEBUG)
          logger.debug(
            `trigger ${AUTOPOST_POST_TASK}-${postId}`,
            { autopostOnPlatforms },
            PREFIX
          );

        await enqueueTask(AUTOPOST_POST_TASK, {
          postId,
          platformIds: autopostOnPlatforms,
        });
      }
    }
  }

  return activitiesCreated;
};
