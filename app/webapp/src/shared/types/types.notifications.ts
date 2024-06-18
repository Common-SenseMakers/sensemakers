export enum ACTIVITY_EVENT_TYPE {
  PostsParsed,
  PostAutoposted,
}

export enum NOTIFICATION_FREQUENCY {
  Instant,
  Daily,
  Weekly,
  Monthly,
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
  title: string;
  body: string;
  activityEventType: ACTIVITY_EVENT_TYPE;
  activityEventIds: string[];
}
