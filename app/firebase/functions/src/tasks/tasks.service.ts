import { Services } from '../instances/services';
import { TasksRepository } from './tasks.repository';
import { enqueueTask } from './tasks.support';

export class TasksService {
  constructor(public repo: TasksRepository) {}

  async enqueue(taskName: string, task: any, services: Services) {
    return enqueueTask(taskName, task, services);
  }
}
