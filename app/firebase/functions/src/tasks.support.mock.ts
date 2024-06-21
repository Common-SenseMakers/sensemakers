import { activityEventCreatedHook } from './activity/activity.created.hook';
import { logger } from './instances/logger';
import { createServices } from './instances/services';
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
      const { db, postsManager } = createServices();

      const postBefore = await db.run(async (manager) =>
        postsManager.processing.posts.get(params.postId, manager, true)
      );

      await parsePostTask({ data: params } as any);

      const postAfter = await db.run(async (manager) =>
        postsManager.processing.posts.get(params.postId, manager, true)
      );

      /** should detect the parse and trigger the autopost if needed */
      const activities = await postUpdatedHook(postAfter, postBefore);

      await Promise.all(
        activities.map((activity) => activityEventCreatedHook(activity))
      );
    }

    if (name === AUTOPOST_POST_TASK) {
      const { db, postsManager } = createServices();

      const postBefore = await db.run(async (manager) =>
        postsManager.processing.posts.get(params.postId, manager, true)
      );

      await autopostPostTask({ data: params } as any);

      const postAfter = await db.run(async (manager) =>
        postsManager.processing.posts.get(params.postId, manager, true)
      );

      /** should create the activity */
      const activities = await postUpdatedHook(postAfter, postBefore);
      await Promise.all(
        activities.map((activity) => activityEventCreatedHook(activity))
      );
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
