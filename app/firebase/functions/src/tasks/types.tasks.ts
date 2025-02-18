import { AppPost } from '../@shared/types/types.posts';

export const TASKS = {
  SYNC_POST_METRICS_TASK: 'syncPostMetrics',
} as const;
export interface TaskRequest {
  [TASKS.SYNC_POST_METRICS_TASK]: {
    posts: AppPost[];
    platformId: string;
    syncNumber: number;
  };
}
