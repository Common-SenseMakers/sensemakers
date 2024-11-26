import { services } from './scripts.services';

const BATCH_SIZE = 100; // Process 100 posts at a time

function chunks<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

(async () => {
  const allPostsIds = await services.postsManager.processing.posts.getAll();
  console.log(
    `Processing ${allPostsIds.length} posts in batches of ${BATCH_SIZE}`
  );

  const batches = chunks([allPostsIds[0]], BATCH_SIZE);

  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

    try {
      const batchPosts = await services.db.run(async (manager) => {
        return Promise.all(
          batch.map((postId) =>
            services.postsManager.processing.getPostFull(postId, manager, true)
          )
        );
      });
      for (const post of batchPosts) {
        console.log(`Processing post ${post.id}`);
        await services.db.run(async (manager) => {
          await services.postsManager.processing.processSemantics(
            post.id,
            manager,
            post.semantics
          );
        });
      }
    } catch (error) {
      console.error(`Error processing batch ${batchIndex + 1}:`, error);
    }
  }
})();
