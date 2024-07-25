import { PlatformPost } from '../../@shared/types/types.platform.posts';
import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';

export const platformPostUpdatedHook = async (
  platformPost: PlatformPost,
  services: Services,
  platformPostBefore?: PlatformPost
) => {
  const platformPostId = platformPost.id;
  const { db, time } = services;

  const updateRef = db.collections.updates.doc(
    `platformPost-${platformPostId}`
  );
  const now = time.now();

  logger.debug(`platformPostUpdatedHook platformPost-${platformPostId}-${now}`);

  await db.run(async (manager) => {
    manager.set(updateRef, { value: now });
  });
};
