import { KeywordEntry } from '../src/@shared/types/types.posts';
import { CollectionNames } from '../src/@shared/utils/collectionNames';
import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  await services.db.run(async (manager) => {
    const snapshot = await services.db.firestore
      .collection(CollectionNames.Keywords)
      .get();

    logger.info(`Keywords: ${snapshot.size}`);

    snapshot.docs.map((doc) => {
      const keywordEntry = doc.data() as KeywordEntry;
      logger.info(`Keyword: ${doc.id}`, keywordEntry);
    });
  });
})();
