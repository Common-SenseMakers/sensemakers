import * as readline from 'readline';

// Import readline module
import { logger } from '../src/instances/logger';

const DEBUG = false;

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

// Function to prompt user for database deletion
export async function promptUser(
  question: string,
  yesAnswer: string = 'Y'
): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toUpperCase() === yesAnswer);
    });
  });
}
