import { Request } from 'firebase-functions/v2/tasks';

import { NOTIFICATION_FREQUENCY } from '../@shared/types/types.notifications';
import { logger } from '../instances/logger';
import { createServices } from '../instances/services';

export const NOTIFY_USER_TASK = 'notifyUser';

/**
 * this will get all unnotified notifications of one user,
 * wrap them into one digest email and send it.
 */
export const notifyUserTask = async (req: Request) => {
  logger.debug(`notifyUserTask - userId: ${req.data.userId}`);

  if (!req.data.userId) {
    throw new Error('userId not found for task notifyUserTask');
  }

  const userId = req.data.userId as string;

  const { notifications } = createServices();
  await notifications.notifyUser(userId);
};

export const triggerSendNotifications = async (
  notificationFrequency: NOTIFICATION_FREQUENCY
) => {
  logger.debug(`triggerSendNotifications`);
  const { users, notifications } = createServices();

  const usersIdsWithFrequency = await users.repo.getWithNotificationFrequency(
    notificationFrequency
  );

  logger.debug(`number of users: ${usersIdsWithFrequency.length}`, undefined);

  await Promise.all(
    usersIdsWithFrequency.map((userId) => {
      notifications.notifyUser(userId);
    })
  );
};
