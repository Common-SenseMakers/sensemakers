import { services } from './scripts.services';

const BATCH_SIZE = 100; // Process 100 posts at a time
const MAX_CONCURRENT_BATCHES = 10; // Maximum number of batches to process simultaneously
const MAX_CONCURRENT_POSTS = 20; // Maximum number of posts to process simultaneously within a batch

function chunks<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

async function processBatch(
  batch: string[],
  batchIndex: number,
  totalBatches: number
) {
  console.log(`Processing batch ${batchIndex + 1}/${totalBatches}`);

  try {
    const batchPosts = await services.db.run(async (manager) => {
      return Promise.all(
        batch.map((postId) =>
          services.postsManager.processing.getPostFull(
            postId,
            {
              addMirrors: false,
              addAggregatedLabels: false,
            },
            manager,
            true
          )
        )
      );
    });

    // Process posts in parallel with concurrency limit
    const processPost = async (post: any) => {
      try {
        await services.db.run(async (manager) => {
          await services.postsManager.processing.processSemantics(
            post.id,
            manager,
            post.semantics
          );
        });
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
      }
    };

    // Process posts with concurrency limit
    for (let i = 0; i < batchPosts.length; i += MAX_CONCURRENT_POSTS) {
      const chunk = batchPosts.slice(i, i + MAX_CONCURRENT_POSTS);
      await Promise.all(chunk.map(processPost));
    }
  } catch (error) {
    console.error(`Error processing batch ${batchIndex + 1}:`, error);
  }
}

(async () => {
  const allPostsIds = await services.postsManager.processing.posts.getAll();
  console.log(
    `Processing ${allPostsIds.length} posts in batches of ${BATCH_SIZE}`
  );
  const batches = chunks(allPostsIds, BATCH_SIZE);

  // Process batches with concurrency limit
  for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
    const batchChunk = batches.slice(i, i + MAX_CONCURRENT_BATCHES);
    await Promise.all(
      batchChunk.map((batch, index) =>
        processBatch(batch, i + index, batches.length)
      )
    );
  } //
})();
