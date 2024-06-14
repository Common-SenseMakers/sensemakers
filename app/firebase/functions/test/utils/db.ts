import { getFirestore } from 'firebase-admin/firestore';

import { initThreads } from '../../src/platforms/twitter/mock/twitter.service.mock';

export const resetDB = async () => {
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
  initThreads();
};
