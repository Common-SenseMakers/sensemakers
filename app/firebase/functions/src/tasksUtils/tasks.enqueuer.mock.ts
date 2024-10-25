import { logger } from '../instances/logger';
import { Services } from '../instances/services';
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
      }

      if (name === AUTOFETCH_POSTS_TASK) {
        await autofetchUserPosts({ data: params } as any, services);
      }
    })();
  } catch (e) {
    logger.error(`Error runing task ${name}`, e);
  }
};
