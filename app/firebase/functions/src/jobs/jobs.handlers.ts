import { onSchedule } from 'firebase-functions/v2/scheduler';

import {
  AUTOFETCH_NON_USER_PERIOD,
  AUTOFETCH_PERIOD,
  SYNC_NEW_POSTS_PERIOD,
} from '../config/config.runtime';
import { firestore, secrets } from '../firestore.config';
import { createServices } from '../instances/services';
import {
  triggerAutofetchPosts,
  triggerAutofetchPostsForNonUsers,
} from '../posts/tasks/posts.autofetch.task';
import { triggerPostMetricsSync } from '../posts/tasks/posts.sync.metrics.task';
import { getConfig } from '../services.config';

/** jobs */
export const accountFetchJobHandler = onSchedule(
  {
    schedule: AUTOFETCH_PERIOD,
    secrets,
  },
  async () => {
    const services = createServices(firestore, getConfig());
    await triggerAutofetchPosts(services);
  }
);
export const nonUserAccountFetchJobHandler = onSchedule(
  {
    schedule: AUTOFETCH_NON_USER_PERIOD,
    secrets,
  },
  async () => {
    const services = createServices(firestore, getConfig());
    await triggerAutofetchPostsForNonUsers(services);
  }
);
export const syncPostMetricsJobHandler = onSchedule(
  {
    schedule: SYNC_NEW_POSTS_PERIOD,
    secrets,
  },
  async () => {
    const services = createServices(firestore, getConfig());
    await triggerPostMetricsSync(services);
  }
);
