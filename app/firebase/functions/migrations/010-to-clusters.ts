import { processInBatches } from '../src/db/db.utils';
import { servicesSource } from './migrations.services';
import { servicesTarget } from './migrations.services';

const DEBUG = true;
const LIMIT = undefined;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  /** assume target starts as a copy of source */

  /** manually delete the links collection from the console */

  /** copy links collection */
  let links = await servicesSource.links.links.getAll();

  if (LIMIT) {
    links = links.slice(0, LIMIT);
  }

  await processInBatches(
    links.map(
      (element) => () =>
        (async (linkId: string) => {
          try {
            if (DEBUG) console.log(`Processing ${linkId}`);

            const link = await servicesSource.db.run((managerSource) => {
              return servicesSource.links.links.get(
                linkId,
                managerSource,
                true
              );
            });

            await servicesTarget.db.run(async (managerTarget) => {
              servicesTarget.links.links.create(link, managerTarget);
            });
          } catch (error) {
            console.error(`Error processing ${linkId}`, error);
          }
        })(element)
    ),
    10
  );

  let postsIds = await servicesTarget.postsManager.processing.posts.getAll();

  if (LIMIT) {
    postsIds = postsIds.slice(0, LIMIT);
  }

  await processInBatches(
    postsIds.map(
      (element) => () =>
        (async (postId: string) => {
          try {
            if (DEBUG) console.log(`Processing ${postId}`);

            await servicesTarget.db.run(async (managerTarget) => {
              const post =
                await servicesTarget.postsManager.processing.posts.get(
                  postId,
                  managerTarget,
                  true
                );

              if (post.originalParsed?.metadata?.ontology) {
                await servicesTarget.postsManager.ontologies.setMany(
                  post.originalParsed.metadata?.ontology,
                  managerTarget
                );
              }

              await servicesTarget.postsManager.processing.processSemantics(
                postId,
                managerTarget,
                post.semantics,
                post.originalParsed
              );
            });
          } catch (error) {
            console.error(`Error processing ${postId}`, error);
          }
        })(element)
    ),
    10
  );
})();
