import { logger } from 'firebase-functions';

import { AppPost } from '../../src/@shared/types/types.posts';
import { DEBUG } from '../../src/emailSender/email.sender.service';
import { Services } from '../../src/instances/services';
import { PostsHelper } from '../../src/posts/posts.helper';
import { getProfileId } from '../../src/profiles/profiles.repository';

export const processPost = async (
  sourcePost: AppPost,
  servicesSource: Services,
  servicesTarget: Services
) => {
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

      targetPost.authorProfileId = getProfileId(
        targetPost.origin,
        targetPost.generic.author.id
      );

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

      const targetMirror = { ...originMirror };
      delete (targetMirror as any)['id'];

      /** missing post_id */
      targetMirror.post_id = originMirror.posted.post_id;

      /** create mirror PlatformPost */
      if (DEBUG) logger.debug(`creating mirror platformPost`, { targetMirror });

      const mirrorTarget =
        servicesTarget.postsManager.processing.platformPosts.create(
          targetMirror,
          managerTarget
        );

      /** connect the platform post witht he app post */
      targetPost.mirrorsIds = [mirrorTarget.id];

      /** create AppPost */
      if (DEBUG) logger.debug(`creating post`, { targetPost });

      const targetPostCreated: AppPost =
        servicesTarget.postsManager.processing.posts.create(
          targetPost,
          managerTarget
        );

      /** process semantics */
      const structured =
        await servicesTarget.postsManager.processing.processSemantics(
          targetPostCreated.id,
          managerTarget,
          sourcePost.semantics
        );

      if (structured) {
        if (DEBUG)
          logger.debug(
            `updating structured semantics ${targetPostCreated.id}`,
            structured
          );
        await servicesTarget.postsManager.processing.posts.update(
          targetPostCreated.id,
          { ...structured },
          managerTarget
        );
      }
    });
  } catch (error) {
    console.error('Error processing post', sourcePost.id, error);
  }
};