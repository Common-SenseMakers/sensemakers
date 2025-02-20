import { PLATFORM } from '../@shared/types/types.platforms';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { fetchPlatformAccountTask } from '../platforms/platforms.tasks';
import { FETCH_ACCOUNT_TASKS } from '../platforms/platforms.tasks.config';
import { autofetchUserPosts } from '../posts/tasks/posts.autofetch.task';
import { parsePostTask } from '../posts/tasks/posts.parse.task';
import { replaceUserTask } from '../posts/tasks/replace.user.task';
import { TASKS } from './types.tasks';

const DEBUG = false;

export const enqueueTaskMockLocal = async (
  name: string,
  params: any,
  services: Services
) => {
  if (DEBUG) logger.debug('enqueueTaskStub', { name, params });

  try {
    await (async () => {
      if (name === TASKS.PARSE_POST) {
        await parsePostTask({ data: params } as any, services);
        return;
      }

      if (name === TASKS.AUTOFETCH_POSTS) {
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

      if (name === TASKS.REPLACE_USER) {
        await replaceUserTask({ data: params }, services);
        return;
      }

      throw Error(`Dont have a mock for task ${name}`);
    })();
  } catch (e) {
    logger.error(`Error runing task ${name}`, e);
  }
};
