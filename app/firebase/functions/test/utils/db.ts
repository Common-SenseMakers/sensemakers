import { getFirestore } from 'firebase-admin/firestore';

import { TestUserCredentials } from '../../src/@shared/types/types.user';
import { initThreads } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TEST_THREADS, globalTestServices } from '../__tests__/setup';
import { testCredentials as _testCredentials } from '../__tests__/test.accounts';

export const resetDB = async (
  testThreads?: string[][],
  testCredentials?: TestUserCredentials[]
) => {
  /** DO NOT DELETE */
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      'Test can only run on emulator. It will delete all current data'
    );
  }

  if (!process.env.FIRESTORE_EMULATOR_HOST.includes('127.0.0.1')) {
    throw new Error(
      'Test can only run on emulator. It will delete all current data'
    );
  }

  const db = getFirestore();

  const collections = await db.listCollections();
  await Promise.all(
    collections.map(async (collection) => {
      return db.recursiveDelete(collection);
    })
  );

  /** reset twitter mock timeline */
  initThreads(testThreads || TEST_THREADS, testCredentials || _testCredentials);

  /** reset time in time mock */
  globalTestServices.time.reset();
};
