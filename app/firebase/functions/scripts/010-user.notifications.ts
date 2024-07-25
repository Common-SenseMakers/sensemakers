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

services.db.run(async (manager) => {
  const user = await services.users.repo.getUser(userId, manager, true);

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

  /** print all user notifications */
  console.log({ user });

  await Promise.all(
    notifications.map(async (notification) => {
      const activity = await services.activity.repo.get(
        notification.activityId,
        manager,
        true
      );
      console.log({ notification, activity });
    })
  );
});
