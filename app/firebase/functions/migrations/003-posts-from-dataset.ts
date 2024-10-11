import { PLATFORM } from '../src/@shared/types/types.platforms';
import { AppPost } from '../src/@shared/types/types.posts';
import { logger } from '../src/instances/logger';
import { PostsHelper } from '../src/posts/posts.helper';
import { getProfileId } from '../src/profiles/profiles.repository';
import { servicesSource, servicesTarget } from './migrations.services';

const DEBUG = true;

(async () => {
  const posts =
    await servicesSource.postsManager.processing.posts.getAllOfQuery(
      {
        origins: [PLATFORM.Mastodon],
        fetchParams: { expectedAmount: 100 },
      },
      1
    );

  logger.info(`Processing ${posts.length} posts`);

  await Promise.all(
    posts.map(async (sourcePost) => {
      try {
        console.log('Processing sourcePost post', sourcePost.id);

        const sourcePostFull = await servicesSource.db.run(
          async (managerSource) => {
            if (DEBUG) logger.debug(`Fetching full post ${sourcePost.id}`);
            const sourcePostFull =
              await servicesSource.postsManager.processing.getPostFull(
                sourcePost.id,
                managerSource,
                true
              );

            if (DEBUG)
              logger.debug(`Full post ${sourcePost.id}`, { sourcePostFull });

            return sourcePostFull;
          }
        );

        await servicesTarget.db.run(async (managerTarget) => {
          /** check this platform post does not already exists */
          const sourceAuthorId = (sourcePost as any)['authorId'];

          /** check if we have  */
          const userExists = await servicesTarget.users.repo.userExists(
            sourceAuthorId,
            managerTarget
          );

          const targetPost: AppPost = {
            ...sourcePost,
          };

          /** the authorId property does not exists anymore */
          delete (targetPost as any)['authorId'];
          delete (targetPost as any)['id'];

          if (DEBUG) logger.debug(`targetPost ready`, { targetPost });

          /**
           * authorUserId is now optional, we will link the post to the user only if it is a signedup user
           * userIds are determinisitc and thus equivalent
           */
          if (userExists) {
            if (DEBUG) logger.debug(`authorUserId exists`, { sourceAuthorId });
            targetPost.authorUserId = sourceAuthorId;
          }

          /** the profile needs to exist */
          const originMirror = PostsHelper.getPostMirror(
            sourcePostFull,
            { platformId: sourcePost.origin },
            true
          );

          if (!originMirror.posted) {
            throw new Error(`Mirror should have a posted property`);
          }

          const existingMirrorId =
            await servicesTarget.postsManager.processing.platformPosts.getFrom_post_id(
              originMirror.platformId,
              originMirror.posted.post_id,
              managerTarget
            );

          if (existingMirrorId) {
            if (DEBUG)
              logger.debug(
                `skiping post ${sourcePost.id}. It already exists in target`,
                {
                  existingMirrorId,
                }
              );
            return;
          }

          const author_user_id = (() => {
            if (originMirror.platformId === PLATFORM.Mastodon) {
              return `${originMirror.posted.post.author.url}`;
            }
            return originMirror.posted.user_id;
          })();

          /** create profile */
          const profileId = getProfileId(sourcePost.origin, author_user_id);
          if (DEBUG) logger.debug(`creating profile exists`, { profileId });

          await servicesTarget.postsManager.getOrCreateProfile(
            profileId,
            managerTarget
          );

          const targetMirror = { ...originMirror };
          delete (targetMirror as any)['id'];

          /** missing post_id */
          targetMirror.post_id = originMirror.posted.post_id;

          /** create mirror PlatformPost */
          if (DEBUG)
            logger.debug(`creating mirror platformPost`, { targetMirror });

          const mirrorTarget =
            servicesTarget.postsManager.processing.platformPosts.create(
              targetMirror,
              managerTarget
            );

          /** connect the platform post witht he app post */
          targetPost.mirrorsIds = [mirrorTarget.id];

          /** create AppPost */
          if (DEBUG) logger.debug(`creating post`, { targetPost });

          servicesTarget.postsManager.processing.posts.create(
            targetPost,
            managerTarget
          );
        });
      } catch (error) {
        console.error('Error processing post', sourcePost.id, error);
      }
    })
  );
})();
