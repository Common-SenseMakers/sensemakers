import { logger } from '../../src/instances/logger';
import { Services } from '../../src/instances/services';
import {
  NOTIFY_USER_TASK,
  notifyUserTask,
} from '../../src/notifications/notification.task';
import {
  AUTOFETCH_POSTS_TASK,
  autofetchUserPosts,
} from '../../src/posts/tasks/posts.autofetch.task';
import {
  AUTOPOST_POST_TASK,
  autopostPostTask,
} from '../../src/posts/tasks/posts.autopost.task';
import {
  PARSE_POST_TASK,
  parsePostTask,
} from '../../src/posts/tasks/posts.parse.task';
import { postUpdatedHookOnTest } from './posts.utils';

export const enqueueTaskMockOnTests = async (
  name: string,
  params: any,
  services: Services
) => {
  logger.debug('enqueueTaskStub', { name, params });

  await (async () => {
    if (name === PARSE_POST_TASK) {
      const { db, postsManager } = services;

      const postBefore = await db.run(
        async (manager) =>
          postsManager.processing.posts.get(params.postId, manager, true),
        undefined,
        undefined,
        `enqueueTaskStub - postBefore ${params.postId}`
      );

      await parsePostTask({ data: params } as any, services);

      const postAfter = await db.run(
        async (manager) =>
          postsManager.processing.posts.get(params.postId, manager, true),
        undefined,
        undefined,
        `enqueueTaskStub - postAfter ${params.postId}`
      );

      /** should detect the parse and trigger the autopost if needed */
      await postUpdatedHookOnTest(postAfter, services, postBefore);
    }

    if (name === AUTOPOST_POST_TASK) {
      const { db, postsManager } = services;

      const postBefore = await db.run(async (manager) =>
        postsManager.processing.posts.get(params.postId, manager, true)
      );

      await autopostPostTask({ data: params } as any, services);

      const postAfter = await db.run(async (manager) =>
        postsManager.processing.posts.get(params.postId, manager, true)
      );

      /** should create the activity */
      await postUpdatedHookOnTest(postAfter, services, postBefore);
    }

    if (name === AUTOFETCH_POSTS_TASK) {
      const postsCreated = await autofetchUserPosts(
        { data: params } as any,
        services
      );

      if (postsCreated === undefined) {
        throw new Error('postsCreated is undefined');
      }

      /** simulate the postUpdated hook with the created posts */
      await Promise.all(
        postsCreated.map(async (postCreated) =>
          postUpdatedHookOnTest(postCreated.post, services)
        )
      );
    }

    if (name === NOTIFY_USER_TASK) {
      if (!services) {
        throw new Error('services are required');
      }

      return notifyUserTask(params.userId, services);
    }
  })();
};
