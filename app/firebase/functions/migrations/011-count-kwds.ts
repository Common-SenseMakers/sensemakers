import { CollectionNames } from '../src/@shared/utils/collectionNames';
import { processInBatches } from '../src/db/db.utils';
import { logger } from '../src/instances/logger';
import { IndexedPostsRepo } from '../src/posts/indexed.posts.repository';
import { servicesSource } from './migrations.services';

const DEBUG = true;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  /** assume target starts as a copy of source */

  /** manually delete the links collection from the console */

  /** copy links collection */
  const snapshot = await servicesSource.db.firestore
    .collection(CollectionNames.Keywords)
    .get();

  logger.info(`Keywords: ${snapshot.size}`);

  const kwds = snapshot.docs.map((doc: any) => doc.id);

  await processInBatches(
    kwds.map(
      (element: any) => () =>
        (async (kw: string) => {
          try {
            if (DEBUG) console.log(`Processing ${kw}`);

            await servicesSource.db.run(async (managerSource) => {
              const cluster = servicesSource.clusters.getInstance();
              const indexedRepo = new IndexedPostsRepo(
                cluster.collection(CollectionNames.Keywords)
              );
              const posts = await indexedRepo.getAllPosts(kw, managerSource);
              indexedRepo.set(kw, { nPosts: posts.length }, managerSource);
            });
          } catch (error) {
            console.error(`Error processing ${kw}`, error);
          }
        })(element)
    ),
    10
  );
})();
