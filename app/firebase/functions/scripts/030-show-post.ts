import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const postId = process.env.POST_ID;
  if (!postId) {
    throw new Error('POST_ID not defined in .script.env');
  }

  await services.db.run(async (manager) => {
    const post = await services.postsManager.getPost(
      postId,
      { addAggregatedLabels: true, addMirrors: true },
      true,
      manager
    );

    logger.info(`Post found: ${post.id}`, post);
  });
})();
