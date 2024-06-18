import { ActivityEventBase } from '../types/types.activity';

export enum NOTIFICATION_FREQUENCY {
  Instant,
  Daily,
  Weekly,
  Monthly,
  None,
}

export enum NotificationStatus {
  pending = 'pending',
  sent = 'sent',
  seen = 'seen',
}

export interface Notification {
  id: string;
  userId: string;
  status: NotificationStatus;
  activityId: string;
}

export type NotificationFull<D = any> = Omit<Notification, 'activityId'> & {
  activity: ActivityEventBase<D>;
};

export type NotificationCreate = Omit<Notification, 'id'>;

export type PostParsedNotification = NotificationFull<{ postId: string }>;
