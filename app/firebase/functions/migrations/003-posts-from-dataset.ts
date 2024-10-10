import { PLATFORM } from '../src/@shared/types/types.platforms';
import { AppPost } from '../src/@shared/types/types.posts';
import { logger } from '../src/instances/logger';
import { PostsHelper } from '../src/posts/posts.helper';
import { getProfileId } from '../src/profiles/profiles.repository';
import { servicesSource, servicesTarget } from './migrations.services';

const includePlatforms: PLATFORM[] = [PLATFORM.Mastodon, PLATFORM.Twitter];

const DEBUG = true;

(async () => {
  const posts =
    await servicesSource.postsManager.processing.posts.getAllOfQuery(
      {
        origins: [PLATFORM.Mastodon, PLATFORM.Twitter],
        fetchParams: { expectedAmount: 50 },
      },
      1
    );

  logger.info(`Processing ${posts.length} posts`);

  await Promise.all(
    posts.map(async (sourcePost) => {
      console.log('Processing sourcePost post', sourcePost.id);

      if (!includePlatforms.includes(sourcePost.origin)) {
        if (DEBUG)
          logger.debug(`skipping ${sourcePost.id} from ${sourcePost.origin}`);
        return;
      }

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

        /** create profile */
        const profileId = getProfileId(
          sourcePost.origin,
          originMirror.posted.user_id
        );
        if (DEBUG) logger.debug(`creating profile exists`, { profileId });
        await servicesTarget.postsManager.getOrCreateProfile(
          profileId,
          managerTarget
        );

        const targetMirror = { ...originMirror };
        delete (targetMirror as any)['id'];

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
    })
  );
})();
