import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import { AppPost } from '../@shared/types/types.posts';

export const TASKS = {
  SYNC_TWITTER_POST_METRICS: 'syncTwitterPostMetrics',
  SYNC_MASTODON_POST_METRICS: 'syncMastodonPostMetrics',
  SYNC_BLUESKY_POST_METRICS: 'syncBlueskyPostMetrics',
  FETCH_TWITTER_ACCOUNT: 'fetchTwitterAccount',
  FETCH_MASTODON_ACCOUNT: 'fetchMastodonAccount',
  FETCH_BLUESKY_ACCOUNT: 'fetchBlueskyAccount',
} as const;

export const PLATFORM_TASKS = {
  SYNC_POST_METRICS_TASK: {
    [PLATFORM.Bluesky]: TASKS.SYNC_BLUESKY_POST_METRICS,
    [PLATFORM.Mastodon]: TASKS.SYNC_MASTODON_POST_METRICS,
    [PLATFORM.Twitter]: TASKS.SYNC_TWITTER_POST_METRICS,
  },
};

export interface SyncPlatformPostMetricsRequest {
  posts: AppPost[];
  platformId: PUBLISHABLE_PLATFORM;
  dispatchNumber: number;
}
export interface TaskRequest {
  [TASKS.SYNC_BLUESKY_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASKS.SYNC_MASTODON_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASKS.SYNC_TWITTER_POST_METRICS]: SyncPlatformPostMetricsRequest;
}
