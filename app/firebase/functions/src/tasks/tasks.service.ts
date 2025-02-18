import { TaskOptions } from 'firebase-admin/functions';

import { Services } from '../instances/services';
import { TasksRepository } from './tasks.repository';
import { enqueueTask } from './tasks.support';
import { TaskRequest } from './types.tasks';

export class TasksService {
  constructor(public repo: TasksRepository) {}

  async enqueue<T extends keyof TaskRequest>(
    taskName: T,
    task: TaskRequest[T],
    services: Services,
    taskOptions?: TaskOptions
  ) {
    return enqueueTask(taskName, task, services, taskOptions);
  }
}
