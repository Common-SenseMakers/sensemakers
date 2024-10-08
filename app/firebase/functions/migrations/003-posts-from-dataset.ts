import { AppPost } from '../src/@shared/types/types.posts';
import { logger } from '../src/instances/logger';
import { servicesSource, servicesTarget } from './migrations.services';

(async () => {
  const posts = await servicesSource.postsManager.processing.posts.getMany({
    fetchParams: { expectedAmount: 10 },
  });

  logger.info(`Processing ${posts.length} posts`);

  await Promise.all(
    posts.map(async (sourcePost) => {
      console.log('Processing sourcePost post', sourcePost.id);

      await servicesTarget.db.run(async (manager) => {
        const sourceAuthorId = sourcePost['authorId'];
        /** authorId does not exists anymore */
        delete sourcePost['authorId'];

        /** check if we have  */
        const userExists = await servicesTarget.users.repo.userExists(
          sourceAuthorId,
          manager
        );

        const targetPost: AppPost = {
          ...sourcePost,
        };

        /**
         * authorUserId is now optional, we will link the post to the user only if it is a signedup user
         * userIds are determinisitc and thus equivalent
         */
        if (userExists) {
          targetPost.authorUserId = sourceAuthorId;
        }

        /** the profile needs to exist */
        const profile = await servicesTarget.users.profiles.getProfile();

        await servicesTarget.postsManager.processing.createAppPost(
          post,
          manager
        );
      });
    })
  );
})();
