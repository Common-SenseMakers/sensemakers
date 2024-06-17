import { logger } from './instances/logger';
import {
  SEND_NOTIFICATION_TASK,
  sendNotificationTask,
} from './notifications/notification.task';
import {
  AUTOFETCH_POSTS_TASK,
  autofetchUserPosts,
} from './posts/tasks/posts.autofetch.task';
import {
  AUTOPOST_POST_TASK,
  autopostPostTask,
} from './posts/tasks/posts.autopost.task';
import { PARSE_POST_TASK, parsePostTask } from './posts/tasks/posts.parse.task';

export const enqueueTaskMock = async (name: string, params: any) => {
  logger.debug('enqueueTaskStub', { name, params });

  await (async () => {
    if (name === PARSE_POST_TASK) {
      return parsePostTask({ data: params } as any);
    }
    if (name === AUTOPOST_POST_TASK) {
      return autopostPostTask({ data: params } as any);
    }
    if (name === AUTOFETCH_POSTS_TASK) {
      return autofetchUserPosts({ data: params } as any);
    }
    if (name === SEND_NOTIFICATION_TASK) {
      return sendNotificationTask({ data: params } as any);
    }
  })();
};
