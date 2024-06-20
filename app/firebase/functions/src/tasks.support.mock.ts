import { logger } from './instances/logger';
import {
  NOTIFY_USER_TASK,
  notifyUserTask,
} from './notifications/notification.task';
import { postUpdatedHook } from './posts/hooks/post.updated.hook';
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
      const postsCreated = await autofetchUserPosts({ data: params } as any);

      /** simulate the postUpdated hook with the created posts */
      await Promise.all(
        postsCreated.map((postCreated) => postUpdatedHook(postCreated.post))
      );
    }
    if (name === NOTIFY_USER_TASK) {
      return notifyUserTask({ data: params } as any);
    }
  })();
};
