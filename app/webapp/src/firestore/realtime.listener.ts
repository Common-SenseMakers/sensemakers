import { onSnapshot } from 'firebase/firestore';

import { collections } from './config';

const DEBUG = true;

export const subscribeToUpdates = (updateId: string, callback: () => void) => {
  const postUpdates = collections.updates(updateId);
  if (DEBUG) console.log('subscribing to updates', updateId);
  return onSnapshot(postUpdates, (doc): void => {
    const data = doc.data();

    if (DEBUG)
      console.log(`onSnapshot ${updateId}`, {
        data,
        metadata: doc.metadata,
      });

    if (data) {
      callback();
    }
  });
};
