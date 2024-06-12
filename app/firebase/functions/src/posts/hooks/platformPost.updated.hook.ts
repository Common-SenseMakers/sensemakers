import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Change } from 'firebase-functions/v1';
import { FirestoreEvent } from 'firebase-functions/v2/firestore';

import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';

export const platformPostUpdatedHook = async (
  event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined>
) => {
  const platformPostId = event.params?.platformPostId;
  const { db, time } = createServices();

  const updateRef = db.collections.updates.doc(
    `platformPost-${platformPostId}`
  );
  const now = time.now();

  logger.debug(`platformPostUpdatedHook platformPost-${platformPostId}-${now}`);

  await db.run(async (manager) => {
    manager.set(updateRef, { value: now });
  });
};
