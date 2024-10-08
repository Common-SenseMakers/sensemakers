import { AppPost } from '../src/@shared/types/types.posts';
import { logger } from '../src/instances/logger';
import { PostsHelper } from '../src/posts/posts.helper';
import { getProfileId } from '../src/profiles/profiles.repository';
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

        /** check if we have  */
        const userExists = await servicesTarget.users.repo.userExists(
          sourceAuthorId,
          manager
        );

        const targetPost: AppPost = {
          ...sourcePost,
        };

        /** the authorId property does not exists anymore */
        delete targetPost['authorId'];

        /**
         * authorUserId is now optional, we will link the post to the user only if it is a signedup user
         * userIds are determinisitc and thus equivalent
         */
        if (userExists) {
          targetPost.authorUserId = sourceAuthorId;
        }

        /** the profile needs to exist */
        const sourcePostFull =
          await servicesSource.postsManager.processing.getPostFull(
            sourcePost.id,
            manager,
            true
          );

        const originMirror = PostsHelper.getPostMirror(
          sourcePostFull,
          { platformId: sourcePost.origin },
          true
        );

        if (!originMirror.posted) {
          throw new Error(`Mirror should have a posted property`);
        }

        /** create profile */
        await servicesTarget.postsManager.getOrCreateProfile(
          getProfileId(sourcePost.origin, originMirror.posted.user_id),
          manager
        );

        /** create mirror PlatformPost */
        const mirrorTarget =
          servicesTarget.postsManager.processing.platformPosts.create(
            originMirror,
            manager
          );

        /** connect the platform post witht he app post */
        targetPost.mirrorsIds = [mirrorTarget.id];

        /** create AppPost */
        servicesTarget.postsManager.processing.posts.create(
          targetPost,
          manager
        );
      });
    })
  );
})();
