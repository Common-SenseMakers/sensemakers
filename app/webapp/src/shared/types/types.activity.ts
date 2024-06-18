export enum ACTIVITY_EVENT_TYPE {
  PostParsed,
  PostAutoposted,
}

export interface ActivityEventBase<D> {
  id: string;
  userId: string;
  type: ACTIVITY_EVENT_TYPE;
  timestamp: number;
  data: D;
}

export type ActivityEventCreate = Omit<ActivityEventBase<any>, 'id'>;

export type ParsedPostActivity = ActivityEventBase<{ postId: string }>;
