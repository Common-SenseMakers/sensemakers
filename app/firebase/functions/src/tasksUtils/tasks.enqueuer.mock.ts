import { logger } from '../instances/logger';
import { createServices } from '../instances/services';
import {
  NOTIFY_USER_TASK,
  notifyUserTask,
} from '../notifications/notification.task';
import {
  AUTOFETCH_POSTS_TASK,
  autofetchUserPosts,
} from '../posts/tasks/posts.autofetch.task';
import {
  AUTOPOST_POST_TASK,
  autopostPostTask,
} from '../posts/tasks/posts.autopost.task';
import {
  PARSE_POST_TASK,
  parsePostTask,
} from '../posts/tasks/posts.parse.task';

export const enqueueTaskMockLocal = async (name: string, params: any) => {
  logger.debug('enqueueTaskStub', { name, params });

  try {
    await (async () => {
      if (name === PARSE_POST_TASK) {
        await parsePostTask({ data: params } as any);
      }

      if (name === AUTOPOST_POST_TASK) {
        await autopostPostTask({ data: params } as any);
      }

      if (name === AUTOFETCH_POSTS_TASK) {
        await autofetchUserPosts({ data: params } as any);
      }

      if (name === NOTIFY_USER_TASK) {
        await notifyUserTask(params.userId, createServices());
      }
    })();
  } catch (e) {
    logger.error(`Error runing task ${name}`, e);
  }
};
