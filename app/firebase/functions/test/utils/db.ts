import { getFirestore } from 'firebase-admin/firestore';

import {
  InitThreadsProfiles,
  initThreads,
} from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TEST_THREADS, globalTestServices } from '../__tests__/setup';
import { testCredentials, testProfilesBase } from '../__tests__/test.accounts';

export const resetDB = async (testThreads?: string[][]) => {
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

  const testProfiles: InitThreadsProfiles[] = [];

  testCredentials.forEach((accountCredentials) => {
    if (accountCredentials.twitter) {
      testProfiles.push({
        id: accountCredentials.twitter.id,
        username: accountCredentials.twitter.username,
      });
    }
  });

  testProfilesBase.forEach((profileData) => {
    if (profileData.profile.profile) {
      testProfiles.push({
        id: profileData.profile.user_id,
        username: profileData.profile.profile.username,
      });
    }
  });

  /** reset twitter mock timeline */
  initThreads(testThreads || TEST_THREADS, testProfiles);

  /** reset time in time mock */
  globalTestServices.time.reset();
};
