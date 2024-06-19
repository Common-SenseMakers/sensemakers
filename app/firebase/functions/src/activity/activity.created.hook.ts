import {
  ActivityEventBase,
  ActivityType,
  PostActData,
} from '../@shared/types/types.activity';
import { NotificationStatus } from '../@shared/types/types.notifications';
import { createServices } from '../instances/services';

// receive the data of the created activity
export const activityEventCreatedHook = async (
  activityEvent: ActivityEventBase
) => {
  const { db, postsManager, notifications } = createServices();

  await db.run(async (manager) => {
    await (async () => {
      if (activityEvent.type === ActivityType.PostAutoposted) {
        // get the author of the post and create one notification for them
        const post = await postsManager.processing.posts.get(
          (activityEvent as ActivityEventBase<PostActData>).data.postId,
          manager,
          true
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
    })();
  });
};
