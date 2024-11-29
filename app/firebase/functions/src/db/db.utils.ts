import { logger } from '../instances/logger';

export const DEBUG = false;

export async function processInBatches<T, R>(
  promiseFunctions: (() => Promise<R>)[],
  batchSize: number
): Promise<R[]> {
  const results: R[] = [];

  if (DEBUG)
    logger.debug(
      `Processing ${promiseFunctions.length} promise functions in batches of ${batchSize}`
    );

  for (let i = 0; i < promiseFunctions.length; i += batchSize) {
    if (DEBUG)
      logger.debug(
        `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(promiseFunctions.length / batchSize)}`
      );

    const batchFunctions = promiseFunctions.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batchFunctions.map((func) => func())
    );

    results.push(...batchResults);
  }

  return results;
}
