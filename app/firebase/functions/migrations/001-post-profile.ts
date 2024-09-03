import { PLATFORM } from '../src/@shared/types/types.user';
import { logger } from '../src/instances/logger';
import { UsersHelper } from '../src/users/users.helper';
import { servicesSource } from './migrations.services';

(async () => {
  const platformPostsIds =
    await servicesSource.postsManager.processing.platformPosts.getAll();

  logger.info(`Processing ${platformPostsIds.length} platformPosts`);

  await Promise.all(
    platformPostsIds.map(async (platformPostsId) => {
      servicesSource.db.run(async (manager) => {
        const platformPost =
          await servicesSource.postsManager.processing.platformPosts.get(
            platformPostsId,
            manager,
            true
          );

        if (
          platformPost.posted &&
          platformPost.platformId === PLATFORM.Twitter
        ) {
          logger.info(`Processing platformPostsId: ${platformPostsId}`);

          const authorId =
            await servicesSource.users.repo.getUserWithPlatformAccount(
              platformPost.platformId,
              platformPost.posted.user_id,
              manager,
              true
            );

          const author = await servicesSource.users.repo.getUser(
            authorId,
            manager,
            true
          );

          const account = UsersHelper.getAccount(
            author,
            platformPost.platformId,
            platformPost.posted.user_id,
            true
          );

          platformPost.posted.author = account.profile;

          logger.info(
            `Updating platformPostsId: ${platformPostsId} - author: ${author.email?.email} - account: ${account.profile?.username}`
          );

          await servicesSource.postsManager.processing.platformPosts.update(
            platformPostsId,
            { posted: platformPost.posted },
            manager
          );
        }
      });
    })
  );
})();
