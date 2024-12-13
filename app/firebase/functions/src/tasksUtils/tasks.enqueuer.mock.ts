import { PLATFORM } from '../@shared/types/types.platforms';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { fetchPlatformAccountTask } from '../platforms/platforms.tasks';
import { FETCH_ACCOUNT_TASKS } from '../platforms/platforms.tasks.config';
import {
  AUTOFETCH_POSTS_TASK,
  autofetchUserPosts,
} from '../posts/tasks/posts.autofetch.task';
import {
  PARSE_POST_TASK,
  parsePostTask,
} from '../posts/tasks/posts.parse.task';

const DEBUG = false;

export const enqueueTaskMockLocal = async (
  name: string,
  params: any,
  services: Services
) => {
  if (DEBUG) logger.debug('enqueueTaskStub', { name, params });

  try {
    await (async () => {
      if (name === PARSE_POST_TASK) {
        await parsePostTask({ data: params } as any, services);
        return;
      }

      if (name === AUTOFETCH_POSTS_TASK) {
        await autofetchUserPosts({ data: params } as any, services);
        return;
      }

      if (
        name === FETCH_ACCOUNT_TASKS[PLATFORM.Twitter] ||
        name === FETCH_ACCOUNT_TASKS[PLATFORM.Mastodon] ||
        name === FETCH_ACCOUNT_TASKS[PLATFORM.Bluesky]
      ) {
        await fetchPlatformAccountTask({ data: params } as any, services);
        return;
      }

      throw Error(`Dont have a mock for task ${name}`);
    })();
  } catch (e) {
    logger.error(`Error runing task ${name}`, e);
  }
};
