import { logger } from '../instances/logger';

export const DEBUG = false;

export interface FetchAndProcess<ProcessResult = any, ItemType = string> {
  fetchPage: (
    lastElementId?: string
  ) => Promise<{ items: ItemType[]; lastId: string }>;
  processItem: (item: ItemType) => Promise<ProcessResult>;
  initialLastElementId?: string;
}

export async function fetchAndProcess<ProcessResult = any, ItemType = string>(
  input: FetchAndProcess<ProcessResult, ItemType>
): Promise<ProcessResult[]> {
  const { fetchPage, processItem, initialLastElementId } = input;

  let hasMore = true;
  let lastElementId = initialLastElementId;

  const results: ProcessResult[] = [];

  while (hasMore) {
    // Fetch one "page" of items based on the lastElementId.
    const { items, lastId } = await fetchPage(lastElementId);
    lastElementId = lastId;

    // If no items returned, assume no more to fetch.
    if (items.length === 0) {
      hasMore = false;
      break;
    }

    const newResults = await Promise.all(
      items.map((item) => processItem(item))
    );

    results.push(...newResults);
  }

  return results;
}

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
