import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import { AppPost } from '../@shared/types/types.posts';
import { FetchPlatfomAccountTaskData } from '../@shared/types/types.profiles';

export enum TASK {
  SYNC_TWITTER_POST_METRICS = 'syncTwitterPostMetrics',
  SYNC_MASTODON_POST_METRICS = 'syncMastodonPostMetrics',
  SYNC_BLUESKY_POST_METRICS = 'syncBlueskyPostMetrics',
  FETCH_TWITTER_ACCOUNT = 'fetchTwitterAccount',
  FETCH_MASTODON_ACCOUNT = 'fetchMastodonAccount',
  FETCH_BLUESKY_ACCOUNT = 'fetchBlueskyAccount',
  PARSE_POST = 'parsePost',
  AUTOFETCH_POSTS = 'autofetchPosts',
  REPLACE_USER = 'replaceUser',
}

export type TasksParams = Record<TASK, any> & {
  [TASK.SYNC_BLUESKY_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASK.SYNC_MASTODON_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASK.SYNC_TWITTER_POST_METRICS]: SyncPlatformPostMetricsRequest;
  [TASK.FETCH_BLUESKY_ACCOUNT]: FetchPlatfomAccountTaskData;
  [TASK.FETCH_MASTODON_ACCOUNT]: FetchPlatfomAccountTaskData;
  [TASK.FETCH_TWITTER_ACCOUNT]: FetchPlatfomAccountTaskData;
  [TASK.PARSE_POST]: ParsePostTaskParams;
};

export const PLATFORM_TASKS = {
  SYNC_POST_METRICS_TASK: {
    [PLATFORM.Bluesky]: TASK.SYNC_BLUESKY_POST_METRICS,
    [PLATFORM.Mastodon]: TASK.SYNC_MASTODON_POST_METRICS,
    [PLATFORM.Twitter]: TASK.SYNC_TWITTER_POST_METRICS,
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
