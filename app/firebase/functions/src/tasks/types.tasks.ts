import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import { AppPost } from '../@shared/types/types.posts';

export const TASKS = {
  SYNC_TWITTER_POST_METRICS_TASK: 'syncTwitterPostMetrics',
  SYNC_MASTODON_POST_METRICS_TASK: 'syncMastodonPostMetrics',
  SYNC_BLUESKY_POST_METRICS_TASK: 'syncBlueskyPostMetrics',
} as const;

export const PLATFORM_TASKS = {
  SYNC_POST_METRICS_TASK: {
    [PLATFORM.Bluesky]: TASKS.SYNC_BLUESKY_POST_METRICS_TASK,
    [PLATFORM.Mastodon]: TASKS.SYNC_MASTODON_POST_METRICS_TASK,
    [PLATFORM.Twitter]: TASKS.SYNC_TWITTER_POST_METRICS_TASK,
  },
};

export interface SyncPlatformPostMetricsRequest {
  posts: AppPost[];
  platformId: PUBLISHABLE_PLATFORM;
  syncNumber: number;
}
export interface TaskRequest {
  [TASKS.SYNC_BLUESKY_POST_METRICS_TASK]: SyncPlatformPostMetricsRequest;
  [TASKS.SYNC_MASTODON_POST_METRICS_TASK]: SyncPlatformPostMetricsRequest;
  [TASKS.SYNC_TWITTER_POST_METRICS_TASK]: SyncPlatformPostMetricsRequest;
}
