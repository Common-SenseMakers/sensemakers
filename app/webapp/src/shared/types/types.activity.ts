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

export type PostActData = { postId: string };
export type ActivityEventCreate<D> = Omit<ActivityEventBase<D>, 'id'>;
