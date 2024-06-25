import {
  ActivityEventBase,
  ActivityType,
  PostActData,
} from '../@shared/types/types.activity';
import {
  NotificationFreq,
  NotificationStatus,
} from '../@shared/types/types.notifications';
import { PlatformPostPublishStatus } from '../@shared/types/types.platform.posts';
import { logger } from '../instances/logger';
import { createServices } from '../instances/services';
import { UsersHelper } from '../users/users.helper';

const DEBUG = true;
const PREFIX = 'ACTIVITY-CREATED-HOOK';

// receive the data of the created activity
export const activityEventCreatedHook = async (
  activityEvent: ActivityEventBase
) => {
  const { db, postsManager, users, notifications } = createServices();

  await db.run(async (manager) => {
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

      const author = await users.repo.getUser(post.authorId, manager, true);

      if (author.settings.notificationFreq !== NotificationFreq.None) {
        const autopostPlatformIds = UsersHelper.autopostPlatformIds(author);

        const onAutpostPlatform = post.mirrors.some((mirror) => {
          /**
           * if the mirror was published and the user has autopost enabled for that
           * platform only create a notification on the autopost activity
           */
          if (
            mirror.publishStatus === PlatformPostPublishStatus.PUBLISHED &&
            autopostPlatformIds.includes(mirror.platformId)
          ) {
            return true;
          } else {
            return false;
          }
        });

        if (DEBUG)
          logger.debug(
            `Author notifications not None ${author.userId}`,
            { autopostPlatformIds, onAutpostPlatform },
            PREFIX
          );

        if (onAutpostPlatform) {
          /**
           * if autopost is enabled, then create the notification when
           * the post is autoposted
           */
          if (activityEvent.type === ActivityType.PostAutoposted) {
            if (DEBUG)
              logger.debug(
                `Create notification of ${activityEvent.type} on post: ${post.id} to user: ${author.userId}`,
                activityEvent,
                PREFIX
              );

            notifications.createNotification(
              {
                userId: post.authorId,
                activityId: activityEvent.id,
                status: NotificationStatus.pending,
              },
              manager
            );
          }
        } else {
          /**
           * if autopost is disabled, then create the notification when
           * the post is parsed
           */
          if (activityEvent.type === ActivityType.PostParsed) {
            if (DEBUG)
              logger.debug(
                `Create notification of ${activityEvent.type} on post: ${post.id} to user: ${author.userId}`,
                activityEvent,
                PREFIX
              );

            notifications.createNotification(
              {
                userId: post.authorId,
                activityId: activityEvent.id,
                status: NotificationStatus.pending,
              },
              manager
            );
          }
        }
      }
    }
  });
};
