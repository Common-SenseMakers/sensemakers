import { instance, spy } from 'ts-mockito';

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

  return instance(Mocked);
};
