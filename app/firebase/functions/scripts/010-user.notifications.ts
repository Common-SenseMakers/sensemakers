import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

const mandatory = ['USER_ID'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const userId = process.env.USER_ID as string;

const DEBUG = false;

services.db.run(async (manager) => {
  const notificationsIds =
    await services.notifications.notificationsRepo.getUnotifiedOfUser(
      userId,
      manager
    );

  const notifications = await Promise.all(
    notificationsIds.map((id) =>
      services.notifications.notificationsRepo.get(userId, id, manager, true)
    )
  );

  await Promise.all(
    notifications.map(async (notification) => {
      const activity = await services.activity.repo.get(
        notification.activityId,
        manager,
        true
      );
      if (DEBUG) logger.debug('user notification', { notification, activity });
    })
  );
});
