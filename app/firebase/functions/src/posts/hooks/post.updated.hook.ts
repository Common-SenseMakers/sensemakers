import {
  AppPostParsedStatus,
  AppPostRepublishedStatus,
} from '../../@shared/types/types.posts';
import { AutopostOption, PLATFORM } from '../../@shared/types/types.user';
import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';
import { enqueueTask } from '../../tasks.support';
import { AUTOPOST_POST_TASK } from '../tasks/posts.autopost.task';
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';

export const postUpdatedHook = async (postId: string) => {
  const { db, time, users, postsManager } = createServices();

  const updateRef = db.collections.updates.doc(`post-${postId}`);
  const now = time.now();

  logger.debug(`postUpdatedHook post-${postId}-${now}`);

  await db.run(async (manager) => {
    manager.set(updateRef, { value: now });
  });

  /** check if it should be auto-parsed or auto published */
  const { post, author } = await db.run(async (manager) => {
    const post = await postsManager.processing.posts.get(postId, manager, true);
    const author = await users.repo.getUser(post.authorId, manager, true);
    return { post, author };
  });

  /** Auto-parse then auto-post */
  const shouldAutopost =
    author.settings.autopost[PLATFORM.Nanopub].value !== AutopostOption.MANUAL;

  logger.debug(`postUpdatedHook -${postId}`, { shouldAutopost, post, author });

  if (shouldAutopost) {
    if (post.parsedStatus === AppPostParsedStatus.UNPROCESSED) {
      logger.debug(`triggerTask ${PARSE_POST_TASK}-${postId}`);
      await enqueueTask(PARSE_POST_TASK, { postId });
    } else if (post.republishedStatus === AppPostRepublishedStatus.PENDING) {
      logger.debug(`triggerTask ${AUTOPOST_POST_TASK}-${postId}`);

      /**
       * Get the platformIds for which the user has set the autpost to
       * not manual
       */
      const platformIds = (
        Object.keys(author.settings.autopost) as PLATFORM[]
      ).filter((platformId: PLATFORM) => {
        if (platformId !== PLATFORM.Nanopub) {
          throw new Error('Only autopost to nanopub is suported for now');
        }

        return (
          author.settings.autopost[platformId].value !== AutopostOption.MANUAL
        );
      });

      await enqueueTask(AUTOPOST_POST_TASK, { postId, platformIds });
    }
  }

  /** notifications? */
};
