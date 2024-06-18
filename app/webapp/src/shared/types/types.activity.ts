export enum ActivityType {
  PostParsed,
  PostAutoposted,
}

export interface ActivityEventBase<D = any> {
  id: string;
  type: ActivityType;
  timestamp: number;
  data: D;
}

export type ActivityEventCreate = Omit<ActivityEventBase<any>, 'id'>;

export type ParsedPostActivity = ActivityEventBase<{ postId: string }>;
