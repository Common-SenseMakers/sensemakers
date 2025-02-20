import { TaskOptions } from 'firebase-admin/functions';

import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { NODE_ENV } from '../config/config.runtime';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { enqueueTaskProduction } from './tasks.enqueuer';
import { enqueueTaskMockLocal } from './tasks.enqueuer.mock';
import { TASKS_NAMES, TasksParams } from './types.tasks';

export class TasksService {
  async enqueue<T extends TASKS_NAMES>(
    taskName: T,
    params: TasksParams[T],
    services: Services,
    taskOptions?: TaskOptions
  ) {
    logger.debug(`enqueueTask ${taskName} on ${NODE_ENV}`, {
      params,
      NODE_ENV,
    });

    if (NODE_ENV === ENVIRONMENTS.LOCAL) {
      return enqueueTaskMockLocal(taskName, params, services);
    }

    return enqueueTaskProduction(taskName, params, taskOptions);
  }
}
