import { Request } from 'firebase-functions/v2/tasks';

import { logger } from '../instances/logger';
import { createServices } from '../instances/services';

export const SEND_NOTIFICATION_TASK = 'sendNotification';

export const sendNotificationTask = async (req: Request) => {
  logger.debug(
    `sendNotificationTask: activityEventId: ${req.data.activityEventId}`
  );
  const activityEventId = req.data.activityEventId as string;

  if (!activityEventId) {
    throw new Error('activityEventId is required');
  }

  const { notifications } = createServices();
  await notifications.sendNotification(activityEventId);
};
