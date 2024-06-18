import { Request } from 'firebase-functions/v2/tasks';

import {
  ActivityEvent,
  NOTIFICATION_FREQUENCY,
} from '../@shared/types/types.notifications';
import { logger } from '../instances/logger';
import { createServices } from '../instances/services';

export const SEND_NOTIFICATION_TASK = 'sendNotification';

export const sendNotificationTask = async (req: Request) => {
  logger.debug(
    `sendNotificationTask: activityEventId: ${req.data.activityEvent}`
  );
  const activityEvent = req.data.activityEvent as ActivityEvent;

  if (!activityEvent) {
    throw new Error('activityEvent is required');
  }

  const { notifications } = createServices();
  const notificationObject = await notifications.createNotificationObject(
    [activityEvent],
    activityEvent.userId,
    activityEvent.type
  );
  await notifications.sendNotification(notificationObject);
};

export const triggerSendNotifications = async (
  notificationFrequency: NOTIFICATION_FREQUENCY
) => {
  logger.debug(`triggerSendNotification`, undefined);
  const { users, notifications } = createServices();

  const usersWithSettings = await users.repo.getWithNotificationFrequency(
    notificationFrequency
  );

  logger.debug(`number of users: ${usersWithSettings.length}`, undefined);

  await Promise.all(
    usersWithSettings.map(({ userId, settings }) => {
      notifications.notifyUser(userId, settings);
    })
  );
};
