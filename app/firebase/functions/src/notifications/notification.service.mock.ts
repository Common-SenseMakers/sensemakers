import { anything, instance, spy, when } from 'ts-mockito';

import { EmailPostDetails, NotificationService } from './notification.service';

export type NotificationsMockConfig = 'real' | 'mock';

export const getNotificationsMock = (
  notificationService: NotificationService,
  type: NotificationsMockConfig
): { instance: NotificationService; mock?: NotificationService } => {
  if (type === 'real') {
    return { instance: notificationService };
  }

  const Mocked = spy(notificationService);

  when(Mocked.sendDigest(anything(), anything())).thenCall(
    (userId: string, posts: EmailPostDetails[]) => {
      const template = `Your recent posts: ${JSON.stringify(posts)}`; // Email clients support templates that receive some parameters
      console.log(`Sending email to ${userId} with template: ${template}`);
    }
  );

  return {
    instance: instance(Mocked),
    mock: Mocked,
  };
};
