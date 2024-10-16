import {
  ActivityEventBase,
  ActivityType,
  PostActData,
} from '../@shared/types/types.activity';
import {
  NotificationFreq,
  NotificationStatus,
} from '../@shared/types/types.notifications';
import { SciFilterClassfication } from '../@shared/types/types.parser';
import { PLATFORM } from '../@shared/types/types.platforms';
import { QUIET_SIGNUP_PERIOD } from '../config/config.runtime';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';

const DEBUG = false;
const PREFIX = 'ACTIVITY-CREATED-HOOK';

// receive the data of the created activity
export const activityEventCreatedHook = async (
  activityEvent: ActivityEventBase,
  services: Services
) => {
  const { db, postsManager, users, notifications, time } = services;

  await db.run(
    async (manager) => {
      /**
       * create a notification object for parsed or autoposted activities
       * depending on the notifications and autpost configuration of the user
       */
      if (
        [ActivityType.PostAutoposted, ActivityType.PostParsed].includes(
          activityEvent.type
        )
      ) {
        if (DEBUG)
          logger.debug(
            `PostParsed or PostAutoposted activity created-${activityEvent.data.postId}`,
            undefined,
            PREFIX
          );

        // get the author of the post and create one notification for them
        const post = await postsManager.processing.getPostFull(
          (activityEvent as ActivityEventBase<PostActData>).data.postId,
          manager,
          true
        );

        if (post.authorUserId) {
          const author = await users.repo.getUser(
            post.authorUserId,
            manager,
            true
          );

          const isQuiet =
            time.now() < author.signupDate + QUIET_SIGNUP_PERIOD &&
            notifications.haveQuiet;

          const hasNotifications =
            author.settings.notificationFreq !== NotificationFreq.None;

          const after = author.settings.autopost[PLATFORM.Nanopub].after;
          const isNewPost = after === undefined || post.createdAtMs > after;

          const isResearch =
            post.originalParsed &&
            [
              SciFilterClassfication.CITOID_DETECTED_RESEARCH,
              SciFilterClassfication.AI_DETECTED_RESEARCH,
            ].includes(post.originalParsed.filter_classification);

          if (DEBUG)
            logger.debug(
              `PostParsed or PostAutoposted activity check ${activityEvent.data.postId}`,
              {
                hasNotifications,
                isQuiet,
                isNewPost,
                isResearch,
                author,
                post,
              },
              PREFIX
            );

          if (hasNotifications && !isQuiet && isResearch && isNewPost) {
            logger.debug(
              `Create notification of ${activityEvent.type} on post: ${post.id} to user: ${author.userId}`,
              activityEvent,
              PREFIX
            );

            notifications.createNotification(
              {
                userId: post.authorUserId,
                activityId: activityEvent.id,
                status: NotificationStatus.pending,
              },
              manager
            );
          }
        }
      }
    },
    undefined,
    undefined,
    `activityCreatedHook ${activityEvent.type} ${activityEvent.data.postId}`
  );
};
