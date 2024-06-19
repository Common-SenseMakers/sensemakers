import {
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
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';

const PREFIX = 'POST-UPDATED-HOOK';

// TODO: change interface to receive post as the after value and also send the previous one
export const postUpdatedHook = async (post: AppPost, postBefore?: AppPost) => {
  const postId = post.id;

  const { db, time, activity } = createServices();

  /** Frontend watcher to react to changes in real-time */
  const updateRef = db.collections.updates.doc(`post-${postId}`);
  const now = time.now();

  logger.debug(`postUpdatedHook post-${postId}-${now}`, undefined, PREFIX);

  await db.run(async (manager) => {
    manager.set(updateRef, { value: now });
  });

  /** handle post create */
  if (postBefore === undefined) {
    // trigger parsePostTask
    logger.debug(`triggerTask ${PARSE_POST_TASK}-${postId}`);
    await enqueueTask(PARSE_POST_TASK, { postId });
  }

  /** Handle post state transition */
  await db.run(async (manager) => {
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

      activity.repo.create(event, manager);
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

      activity.repo.create(event, manager);
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
  });
};
