import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Change } from 'firebase-functions/v1';
import { FirestoreEvent } from 'firebase-functions/v2/firestore';

import {
  AppPostParsedStatus,
  AppPostRepublishedStatus,
} from '../../@shared/types/types.posts';
import { AutopostOption } from '../../@shared/types/types.user';
import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';
import { enqueueTask } from '../../tasks.support';
import { AUTOPOST_POST_TASK } from '../tasks/posts.autopost.task';
import { PARSE_POST_TASK } from '../tasks/posts.parse.task';

export const postUpdatedHook = async (
  event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined>
) => {
  const postId = event.params?.postId;
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

  /** Auto-parsed then auto-posted */
  if (author.settings.autopost !== AutopostOption.MANUAL) {
    if (post.parsedStatus === AppPostParsedStatus.UNPROCESSED) {
      logger.debug(`triggerTask ${PARSE_POST_TASK}-${postId}`);
      await enqueueTask(PARSE_POST_TASK, { postId });
    } else if (post.republishedStatus === AppPostRepublishedStatus.PENDING) {
      logger.debug(`triggerTask ${AUTOPOST_POST_TASK}-${postId}`);
      await enqueueTask(AUTOPOST_POST_TASK, { postId });
    }
  }

  /** notifications? */
};
