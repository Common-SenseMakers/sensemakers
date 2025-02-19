import { TaskOptions } from 'firebase-admin/functions';

import { Services } from '../instances/services';
import { enqueueTask } from './tasks.support';
import { TaskRequest } from './types.tasks';

export class TasksService {
  async enqueue<T extends keyof TaskRequest>(
    taskName: T,
    task: TaskRequest[T],
    services: Services,
    taskOptions?: TaskOptions
  ) {
    return enqueueTask(taskName, task, services, taskOptions);
  }
}
