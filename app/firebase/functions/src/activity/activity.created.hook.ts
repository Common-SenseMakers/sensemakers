import {
  ActivityEventBase,
  ActivityType,
  ParsedPostActivity,
} from '../@shared/types/types.activity';
import { createServices } from '../instances/services';

// receive the data of the created activity
export const activityEventCreatedHook = async (
  activityEvent: ActivityEventBase
) => {
  const { db, users, postsManager, notifications } = createServices();

  await db.run(async (manager) => {
    await (async () => {
      if (activityEvent.type === ActivityType.PostAutoposted) {
        // get the author of the post and create one notification for them
        const post = await postsManager.processing.posts.get(
          (activityEvent as ParsedPostActivity).data.postId,
          manager,
          true
        );

        await notifications.createNotification({});
      }
    })();
  });
};
