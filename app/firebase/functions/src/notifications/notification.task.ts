import { NotificationFreq } from '../@shared/types/types.notifications';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { enqueueTask } from '../tasksUtils/tasks.support';

export const NOTIFY_USER_TASK = 'notifyUser';

/**
 * this will get all unnotified notifications of one user,
 * wrap them into one digest email and send it.
 */
export const notifyUserTask = async (userId: string, services: Services) => {
  logger.debug(`notifyUserTask - userId: ${userId}`);
  const { notifications } = services;
  await notifications.notifyUser(userId);
};

export const triggerSendNotifications = async (
  notificationFrequency: NotificationFreq,
  services: Services
) => {
  logger.debug(`triggerSendNotifications`);
  const { users } = services;

  const usersIdsWithFrequency = await users.repo.getWithNotificationFrequency(
    notificationFrequency
  );

  logger.debug(`number of users: ${usersIdsWithFrequency.length}`, undefined);

  await Promise.all(
    usersIdsWithFrequency.map((userId) =>
      (enqueueTask as any)(NOTIFY_USER_TASK, { userId }, services)
    )
  );
};
