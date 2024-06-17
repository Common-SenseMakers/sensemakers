export enum ACTIVITY_EVENT_TYPE {
  PostsParsed,
}

export enum NOTIFICATION_FREQUENCY {
  Instant,
  Daily,
  Weekly,
  None,
}

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ACTIVITY_EVENT_TYPE;
  timestamp: number;
  involvedDocuments: Record<string, string[]>; // key is the collection name, value is the list of document ids
  notified: boolean;
  message: string;
}

export type ActivityEventCreate = Omit<ActivityEvent, 'id'>;

export interface Notification {
  userId: string;
  activityEventId: string;
  sent: boolean;
}
