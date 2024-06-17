import { anything, instance, spy, when } from 'ts-mockito';

import { NotificationService } from './notification.service';

export type NotificationsMockConfig = 'real' | 'mock';

export const getNotificationsMock = (
  notificationService: NotificationService,
  type: NotificationsMockConfig
) => {
  if (type === 'real') {
    return notificationService;
  }

  const Mocked = spy(notificationService);

  when(Mocked.sendNotificationInternal(anything())).thenCall(
    async (activityEventId: string) => {
      console.log('Sending email to', activityEventId);
      return Promise.resolve();
    }
  );

  return instance(Mocked);
};
