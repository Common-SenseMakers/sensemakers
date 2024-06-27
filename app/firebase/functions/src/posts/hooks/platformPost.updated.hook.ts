import { PlatformPost } from '../../@shared/types/types.platform.posts';
import { logger } from '../../instances/logger';
import { createServices } from '../../instances/services';

export const platformPostUpdatedHook = async (
  platformPost: PlatformPost,
  platformPostBefore?: PlatformPost
) => {
  const platformPostId = platformPost.id;
  const { db, time } = createServices();

  const updateRef = db.collections.updates.doc(
    `platformPost-${platformPostId}`
  );
  const now = time.now();

  logger.debug(`platformPostUpdatedHook platformPost-${platformPostId}-${now}`);

  await db.run(async (manager) => {
    manager.set(updateRef, { value: now });
  });
};
