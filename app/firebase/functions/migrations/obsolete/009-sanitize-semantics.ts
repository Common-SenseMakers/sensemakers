import { AppPost } from '../../src/@shared/types/types.posts';
import { processInBatches } from '../../src/db/db.utils';
import { servicesSource } from '../migrations.services';

const DEBUG = true;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const posts =
    await servicesSource.postsManager.processing.posts.getAllOfQuery(
      {
        fetchParams: { expectedAmount: 10 },
        hydrateConfig: { addAggregatedLabels: false, addMirrors: false },
      },
      undefined
    );

  const process = async (post: AppPost) => {
    try {
      if (DEBUG) console.log(`Processing ${post.id}`);

      await servicesSource.db.run(async (managerSource) => {
        if (post.originalParsed) {
          const newParsed =
            await servicesSource.postsManager.sanitizeParserResult(
              post,
              post.originalParsed
            );

          await servicesSource.postsManager.updatePost(
            post.id,
            { originalParsed: newParsed, semantics: newParsed.semantics },
            managerSource
          );
        }
      });
    } catch (error) {
      console.error(`Error processing ${post.id}`, error);
    }
  };

  // const post = await servicesSource.db.run(async (managerSource) => {
  //   return servicesSource.postsManager.processing.posts.get(
  //     '9DiikONjWM8yTLRIVbhf',
  //     managerSource,
  //     true
  //   );
  // });

  // await process(post);

  await processInBatches(
    posts.map((post) => () => process(post)),
    10
  );
})();
