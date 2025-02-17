import { TaskOptions } from 'firebase-admin/functions';

import { Services } from '../instances/services';
import { TasksRepository } from './tasks.repository';
import { enqueueTask } from './tasks.support';

export class TasksService {
  constructor(public repo: TasksRepository) {}

  async enqueue(
    taskName: string,
    task: any,
    services: Services,
    taskOptions?: TaskOptions
  ) {
    return enqueueTask(taskName, task, services, taskOptions);
  }
}
