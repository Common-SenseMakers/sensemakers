import {
  ActivityEventBase,
  ActivityEventCreate,
  ActivityType,
  PostActData,
} from '../../@shared/types/types.activity';
import {
  AppPost,
  AppPostParsedStatus,
  AppPostParsingStatus,
} from '../../@shared/types/types.posts';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';
import { enqueueTask } from '../../tasksUtils/tasks.support';
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

  const { db, time, activity } = services;

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
    if (post.parsedStatus !== AppPostParsedStatus.PROCESSED) {
      await enqueueTask(PARSE_POST_TASK, { postId }, services);
    }
  } else if (

  /** Handle post merged */
    post.parsedStatus !== AppPostParsedStatus.PROCESSED &&
    postBefore?.parsingStatus === AppPostParsingStatus.IDLE
  ) {
    if (DEBUG) logger.debug(`triggerTask ${PARSE_POST_TASK}-${postId}`);
    await enqueueTask(PARSE_POST_TASK, { postId });
  }

  const activitiesCreated: ActivityEventBase[] = [];

  /** Create the activity elements */
  await db.run(
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

      if (DEBUG)
        logger.debug(
          `postUpdatedHook -${postId}`,
          {
            post,
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

  return activitiesCreated;
};
