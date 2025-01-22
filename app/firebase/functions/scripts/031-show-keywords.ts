import { CollectionNames } from '../src/@shared/utils/collectionNames';
import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const snapshot = await services.db.firestore
    .collection(CollectionNames.Refs)
    .get();
  logger.info(`Keywords: ${snapshot.size}`);
})();
