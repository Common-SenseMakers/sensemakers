import { AppPostParsedStatus } from '../../src/@shared/types/types.posts';
import { logger } from '../../src/instances/logger';
import { servicesSource } from '../migrations.services';

(async () => {
  const postsIds = await servicesSource.postsManager.processing.posts.getAll();

  logger.info(`Processing ${postsIds.length} posts`);

  await Promise.all(
    postsIds.map(async (postId) => {
      console.log('Processing post', postId);
      await servicesSource.db.run(async (manager) => {
        await servicesSource.postsManager.updatePost(
          postId,
          { parsedStatus: AppPostParsedStatus.PROCESSED },
          manager
        );
      });
    })
  );
})();
