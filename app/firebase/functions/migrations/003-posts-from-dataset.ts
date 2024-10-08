import { logger } from '../src/instances/logger';
import { servicesSource, servicesTarget } from './migrations.services';

(async () => {
  const posts = await servicesSource.postsManager.processing.posts.getMany({
    fetchParams: { expectedAmount: 10 },
  });

  logger.info(`Processing ${posts.length} posts`);

  await Promise.all(
    posts.map(async (post) => {
      console.log('Processing post', post.id);
      await servicesTarget.db.run(async (manager) => {
        await servicesTarget.postsManager.processing.createAppPost(
          post,
          manager
        );
      });
    })
  );
})();
