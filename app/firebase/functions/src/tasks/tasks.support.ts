import { ENVIRONMENTS } from '../config/ENVIRONMENTS';
import { NODE_ENV } from '../config/config.runtime';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { enqueueTaskProduction } from './tasks.enqueuer';
import { enqueueTaskMockLocal } from './tasks.enqueuer.mock';

export const enqueueTask = async (
  name: string,
  params: any,
  services: Services
) => {
  logger.debug(`enqueueTask ${name} on ${NODE_ENV}`, { params, NODE_ENV });

  if (NODE_ENV === ENVIRONMENTS.LOCAL) {
    return enqueueTaskMockLocal(name, params, services);
  }

  return enqueueTaskProduction(name, params);
};

export function chunkNumber(total: number, chunkSize: number): number[] {
  const chunks: number[] = [];
  while (total > chunkSize) {
    chunks.push(chunkSize);
    total -= chunkSize;
  }
  if (total > 0) {
    chunks.push(total);
  }
  return chunks;
}

export const splitIntoBatches = <T>(array: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};
