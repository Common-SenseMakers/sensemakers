import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { logger } from '../../src/instances/logger';
import { services } from '../scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const platform = process.env.PLATFORM as PLATFORM;
  const post_id = process.env.POST_ID;
  if (!platform || !post_id) {
    throw new Error('PLATFORM or POST_ID not defined in .script.env');
  }

  const platformPost = await services.db.run(async (manager) => {
    const platformPostId =
      await services.postsManager.processing.platformPosts.getFrom_post_id(
        platform,
        post_id,
        manager,
        true
      );

    return services.postsManager.processing.platformPosts.get(
      platformPostId,
      manager,
      true
    );
  });

  logger.info(`PlatformPost found: ${platformPost.id}`, { platformPost });

  const post = await services.db.run(async (manager) => {
    if (!platformPost.postId) {
      throw new Error('PostId not found');
    }
    return services.postsManager.getPost(
      platformPost.postId,
      { addMirrors: true },
      true,
      manager
    );
  });

  logger.info(`Post found: ${post.id}`, { post });
})();
