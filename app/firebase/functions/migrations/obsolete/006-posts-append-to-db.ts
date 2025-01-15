import { AppPost } from '../../src/@shared/types/types.posts';
import { AccountProfile } from '../../src/@shared/types/types.profiles';
import { getProfileId } from '../../src/@shared/utils/profiles.utils';
import { processInBatches } from '../../src/db/db.utils';
import { logger } from '../../src/instances/logger';
import { PostsHelper } from '../../src/posts/posts.helper';
import { servicesSource, servicesTarget } from '../migrations.services';

const DEBUG = false;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const posts =
    await servicesSource.postsManager.processing.posts.getAllOfQuery(
      {
        origins: [],
        fetchParams: { expectedAmount: 100 },
      },
      undefined
    );

  logger.info(`Processing ${posts.length} posts`);

  const sourceProfilesMap: Map<string, AccountProfile> = new Map();
  const sourceProfiles = await servicesSource.users.profiles.getAll();

  sourceProfiles.forEach((profile) => {
    sourceProfilesMap.set(profile.id, profile);
  });

  const processPost = async (sourcePost: AppPost) => {
    try {
      if (DEBUG) console.log('Processing sourcePost post', sourcePost.id);

      const sourcePostFull = await servicesSource.db.run(
        async (managerSource) => {
          if (DEBUG) logger.debug(`Fetching full post ${sourcePost.id}`);
          const sourcePostFull =
            await servicesSource.postsManager.processing.getPostFull(
              sourcePost.id,
              {},
              managerSource,
              true
            );

          if (DEBUG)
            logger.debug(`Full post ${sourcePost.id}`, { sourcePostFull });

          return sourcePostFull;
        }
      );

      await servicesTarget.db.run(async (managerTarget) => {
        const targetPost: AppPost = {
          ...sourcePost,
        };

        delete (targetPost as any)['id'];

        /** the profile needs to exist */
        const originMirror = PostsHelper.getPostMirror(
          sourcePostFull,
          { platformId: sourcePost.origin },
          true
        );

        if (DEBUG)
          logger.debug(
            `targetPost ready. sourcePost: ${sourcePost.id} - originMirror: ${originMirror.post_id}`,
            { targetPost }
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

        const author_user_id = originMirror.posted.user_id;

        /** create profile */
        const targetProfile = await servicesTarget.users.profiles.getProfile(
          originMirror.platformId,
          originMirror.posted.user_id,
          managerTarget
        );

        if (!targetProfile) {
          const sourceProfile = sourceProfilesMap.get(
            getProfileId(originMirror.platformId, author_user_id)
          );

          if (!sourceProfile) {
            throw new Error(`Profile ${author_user_id} not found`);
          }

          servicesTarget.users.createProfile(sourceProfile, managerTarget);
        }

        /** create mirror PlatformPost */
        const targetMirror = { ...originMirror };
        delete (targetMirror as any)['id'];

        if (DEBUG)
          logger.debug(
            `creating mirror platformPost for ${targetMirror.post_id}`,
            { targetMirror }
          );

        const mirrorTarget =
          servicesTarget.postsManager.processing.platformPosts.create(
            targetMirror,
            managerTarget
          );

        /** connect the platform post witht he app post */
        targetPost.mirrorsIds = [mirrorTarget.id];

        /** create AppPost */
        if (DEBUG)
          logger.debug(`creating post for mirror ${mirrorTarget.post_id}`, {
            targetPost,
          });

        servicesTarget.postsManager.processing.posts.create(
          targetPost,
          managerTarget
        );
      });
    } catch (error) {
      console.error('Error processing post', sourcePost.id, error);
    }
  };

  await processInBatches(
    posts.map((post) => () => processPost(post)),
    10
  );
})();
