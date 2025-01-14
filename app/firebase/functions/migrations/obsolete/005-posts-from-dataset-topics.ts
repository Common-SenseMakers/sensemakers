import { StructuredSemantics } from '../../src/@shared/types/types.posts';
import { logger } from '../../src/instances/logger';
import { servicesSource, servicesTarget } from '../migrations.services';

const DEBUG = true;

(async () => {
  const posts =
    await servicesSource.postsManager.processing.posts.getAllOfQuery(
      {
        origins: [],
        fetchParams: { expectedAmount: 100 },
      },
      undefined
    );

  logger.info(`Processing ${posts.length} posts`);

  await Promise.all(
    posts.map(async (sourcePost) => {
      try {
        if (DEBUG) {
          console.log('Processing sourcePost post', sourcePost.id);
        }

        await servicesTarget.db.run(async (managerTarget) => {
          if (!sourcePost.structuredSemantics) return;

          const topics = (sourcePost.structuredSemantics as any)['topics'];

          if (!topics) return;

          // If it has old topics, fix it
          const structuredSemantics: StructuredSemantics = {
            ...sourcePost.structuredSemantics,
          };

          /** the authorId property does not exists anymore */
          delete (structuredSemantics as any)['topics'];

          if (structuredSemantics && topics && topics.length > 0) {
            structuredSemantics.topic = topics[0];
          }

          servicesTarget.postsManager.processing.posts.update(
            sourcePost.id,
            {
              structuredSemantics,
            },
            managerTarget
          );
        });
      } catch (error) {
        console.error('Error processing post', sourcePost.id, error);
      }
    })
  );
})();
