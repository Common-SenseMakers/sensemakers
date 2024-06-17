import { NOTIFICATION_FREQUENCY } from '../@shared/types/types.notifications';
import { createServices } from '../instances/services';
import { enqueueTask } from '../tasks.support';
import { ActivityRepository } from './activity.repository';
import { SEND_NOTIFICATION_TASK } from './notification.task';

export const activityEventCreatedHook = async (activityEventId: string) => {
  const { db, users } = createServices();

  await db.run(async (manager) => {
    const activityRepo = new ActivityRepository(db);
    const activityEvent = await activityRepo.get(
      activityEventId,
      manager,
      true
    );

    const userProfile = await users.getUserProfile(
      activityEvent.userId,
      manager
    );

    if (
      userProfile.settings.notificationFrequency ===
      NOTIFICATION_FREQUENCY.Instant
    ) {
      await enqueueTask(SEND_NOTIFICATION_TASK, { activityEventId });
    }
  });
};
