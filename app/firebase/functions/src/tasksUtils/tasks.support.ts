import { NODE_ENV } from '../config/config.runtime';
import { enqueueTaskProduction } from './tasks.enqueuer';
import { enqueueTaskMockLocal } from './tasks.enqueuer.mock';

export const enqueueTask = async (name: string, params: any) => {
  if (NODE_ENV === 'development') {
    return enqueueTaskMockLocal(name, params);
  }

  return enqueueTaskProduction(name, params);
};
