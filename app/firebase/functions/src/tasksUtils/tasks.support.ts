import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { NODE_ENV } from '../config/config.runtime';
import { logger } from '../instances/logger';
import { createServices } from '../instances/services';
import { enqueueTaskProduction } from './tasks.enqueuer';
import { enqueueTaskMockLocal } from './tasks.enqueuer.mock';

export const enqueueTask = async (name: string, params: any) => {
  logger.debug(`enqueueTask ${name} on ${NODE_ENV}`, { params, NODE_ENV });

  if (NODE_ENV === ENVIRONMENTS.LOCAL) {
    return enqueueTaskMockLocal(name, params, createServices());
  }

  return enqueueTaskProduction(name, params);
};
