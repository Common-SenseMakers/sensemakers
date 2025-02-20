import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import { AppPost } from '../@shared/types/types.posts';
import { FetchPlatfomAccountTaskData } from '../@shared/types/types.profiles';

export const TASKS = {
  SYNC_TWITTER_POST_METRICS: 'syncTwitterPostMetrics',
  SYNC_MASTODON_POST_METRICS: 'syncMastodonPostMetrics',
  SYNC_BLUESKY_POST_METRICS: 'syncBlueskyPostMetrics',
  FETCH_TWITTER_ACCOUNT: 'fetchTwitterAccount',
  FETCH_MASTODON_ACCOUNT: 'fetchMastodonAccount',
  FETCH_BLUESKY_ACCOUNT: 'fetchBlueskyAccount',
  PARSE_POST: 'parsePost',
  AUTOFETCH_POSTS: 'autofetchPosts',
  REPLACE_USER: 'replaceUser',
} as const;

export type TASKS_NAMES = keyof typeof TASKS;

export type TasksParams = Record<keyof typeof TASKS, any> & {
  [TASKS.SYNC_BLUESKY_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASKS.SYNC_MASTODON_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASKS.SYNC_TWITTER_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASKS.FETCH_BLUESKY_ACCOUNT]: FetchPlatfomAccountTaskData;
  [TASKS.FETCH_MASTODON_ACCOUNT]: FetchPlatfomAccountTaskData;
  [TASKS.FETCH_TWITTER_ACCOUNT]: FetchPlatfomAccountTaskData;
  [TASKS.PARSE_POST]: ParsePostTaskParams;
};

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

export interface ParsePostTaskParams {
  postId: string;
}
