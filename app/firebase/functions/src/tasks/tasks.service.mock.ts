import { anything, instance, mock, when } from 'ts-mockito';

import { Services } from '../instances/services';
import { TasksService } from './tasks.service';

export interface TasksMock extends TasksService {}

export const getTasksMock = (
  timeService: TasksService,
  type: 'mock' | 'real'
) => {
  if (type === 'real') {
    return timeService;
  }

  const Mocked = mock(TasksService);

  when(Mocked.enqueue(anything(), anything(), anything())).thenCall(
    async (taskName: string, req: any, services: Services): Promise<void> => {
      return new Promise((resolve) => {
        resolve();
      });
    }
  );

  const _instance = instance(Mocked) as TasksMock;

  return _instance;
};
