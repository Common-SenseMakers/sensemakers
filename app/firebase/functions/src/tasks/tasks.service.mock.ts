import { TaskOptions } from 'firebase-admin/functions';
import { anything, instance, mock, when } from 'ts-mockito';

import { PLATFORM } from '../@shared/types/types.platforms';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { fetchPlatformAccountTask } from '../platforms/platforms.tasks';
import { FETCH_ACCOUNT_TASKS } from '../platforms/platforms.tasks.config';
import { autofetchUserPosts } from '../posts/tasks/posts.autofetch.task';
import { parsePostTask } from '../posts/tasks/posts.parse.task';
import { replaceUserTask } from '../posts/tasks/replace.user.task';
import { TasksService } from './tasks.service';
import { TASK } from './types.tasks';

const DEBUG = true;

export interface TasksMock extends TasksService {}

export const getTasksMock = (
  timeService: TasksService,
  type: 'mock' | 'real'
) => {
  if (type === 'real') {
    return timeService;
  }

  const Mocked = mock(TasksService);

  when(Mocked.enqueue(anything(), anything(), anything(), anything())).thenCall(
    async (
      name: TASK,
      params: any,
      taskOptions?: TaskOptions,
      services?: Services
    ): Promise<void> => {
      if (DEBUG) logger.debug('enqueueTaskMock', { name, params });
      if (!services) throw new Error('services is required');

      try {
        await (async () => {
          if (name === TASK.PARSE_POST) {
            await parsePostTask({ data: params }, services);
            return;
          }

          if (name === TASK.AUTOFETCH_POSTS) {
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

          if (name === TASK.REPLACE_USER) {
            await replaceUserTask({ data: params }, services);
            return;
          }

          throw Error(`Dont have a mock for task ${name}`);
        })();
      } catch (e) {
        logger.error(`Error runing task ${name}`, e);
      }
    }
  );

  const _instance = instance(Mocked) as TasksMock;

  return _instance;
};
