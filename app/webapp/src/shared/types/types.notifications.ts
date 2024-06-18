import { ParsedPostActivity } from '../types/types.activity';

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

export interface Notification<A = any> {
  id: string;
  userId: string;
  status: NotificationStatus;
  activity: A;
}

export type PostParsedNotification = Notification<ParsedPostActivity>;
