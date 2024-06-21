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
import { createServices } from '../../instances/services';
import { enqueueTask } from '../../tasks.support';
import { UsersHelper } from '../../users/users.helper';
import { AUTOPOST_POST_TASK } from '../tasks/posts.autopost.task';
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';

const PREFIX = 'POST-UPDATED-HOOK';

// TODO: change interface to receive post as the after value and also send the previous one
export const postUpdatedHook = async (post: AppPost, postBefore?: AppPost) => {
  const postId = post.id;

  const { db, time, activity, users } = createServices();

  /** Frontend watcher to react to changes in real-time */
  const updateRef = db.collections.updates.doc(`post-${postId}`);
  const now = time.now();

  logger.debug(`postUpdatedHook post-${postId}-${now}`, undefined, PREFIX);

  await db.run(async (manager) => {
    manager.set(updateRef, { value: now });
  });

  /** Handle post create */
  if (postBefore === undefined) {
    // trigger parsePostTask
    logger.debug(`triggerTask ${PARSE_POST_TASK}-${postId}`);
    await enqueueTask(PARSE_POST_TASK, { postId });
  }

  const activitiesCreated: ActivityEventBase[] = [];

  /** Create the activity elements */
  const { wasParsed } = await db.run(async (manager) => {
    /** detect parsed state change */
    const wasParsed =
      postBefore &&
      postBefore.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
      post.parsedStatus === AppPostParsedStatus.PROCESSED;

    if (wasParsed) {
      logger.debug(`wasParsed ${PARSE_POST_TASK}-${postId}`, undefined, PREFIX);
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
  });

  /** trigger Autopost*/
  if (wasParsed) {
    const author = await db.run(async (manager) =>
      users.repo.getUser(post.authorId, manager, true)
    );
    /** autopost when parsed and author has autopost enabled */
    /** trigger autopost task if author has autopost configured  */
    const autopostOnPlatforms = UsersHelper.autopostPlatformIds(author);

    if (autopostOnPlatforms.length > 0) {
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

  return activitiesCreated;
};
