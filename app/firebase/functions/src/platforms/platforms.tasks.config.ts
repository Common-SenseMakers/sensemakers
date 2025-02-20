import { PLATFORM } from '../@shared/types/types.platforms';
import { TASK } from '../tasks/types.tasks';

export const FETCH_ACCOUNT_TASKS = {
  [PLATFORM.Twitter]: TASK.FETCH_TWITTER_ACCOUNT,
  [PLATFORM.Mastodon]: TASK.FETCH_MASTODON_ACCOUNT,
  [PLATFORM.Bluesky]: TASK.FETCH_BLUESKY_ACCOUNT,
};

export const FETCH_TASK_DISPATCH_RATES = {
  /** TWITTER
   * 10 requests / 15 minutes
   * assume 2 API calls per fetch on average
   * thus 5 fetches / 15 minutes
   * or 1 fetch every 3 minutes
   */
  [PLATFORM.Twitter]: 1 / (60 * 3), // 1 task every 180 seconds

  /** MASTODON
   * 300 requests / 5 minutes
   * assume 2 API calls per fetch on average + 1 for account name to id lookup + 1 for redundancy (to be able to account for adding accounts in batches)
   * 75 fetches / 5 minutes
   * or 1 fetch every 4 seconds
   */
  [PLATFORM.Mastodon]: 1 / 4, // 1 task every 4 seconds

  /** BLUESKY
   * 3000 requests / 5 minutes
   * assume 2 API calls per fetch on average + 1 for token refreshing (~every 1 hour) and redundancy
   * 1000 fetches / 5 minutes
   * or 10 fetch every 3 seconds
   */
  [PLATFORM.Bluesky]: 10 / 3, // 10 task every 3 seconds
};

export const SYNC_METRICS_TASK_DISPATCH_RATES = {
  /** TWITTER
   * 15 requests / 15 minutes
   * divide by 2 to be safe
   * 1 fetch every 2 minutes
   */
  [PLATFORM.Twitter]: 1 / (60 * 2), // 1 task every 120 seconds

  /** MASTODON
   * 300 requests / 5 minutes
   * assume 2 API calls per fetch on average + 1 for account name to id lookup + 1 for redundancy (to be able to account for adding accounts in batches)
   * 75 fetches / 5 minutes
   * or 1 fetch every 4 seconds
   */
  [PLATFORM.Mastodon]: 1 / (4 * 2), // 1 task every 8 seconds

  /** BLUESKY
   * 3000 requests / 5 minutes
   * assume 2 API calls per fetch on average + 1 for token refreshing (~every 1 hour) and redundancy
   * 1000 fetches / 5 minutes
   * or 10 fetch every 3 seconds
   */
  [PLATFORM.Bluesky]: 10 / (3 * 2), // 10 task every 6 seconds
};
