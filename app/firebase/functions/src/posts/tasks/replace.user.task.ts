import { logger } from '../../instances/logger';
import { Services } from '../../instances/services';

export const REPLACE_USER_TASK = 'replaceUser';

const DEBUG = true;

export const replaceUserTask = async (
  req: { data: { existingUserId: string; newUserId: string } },
  services: Services
) => {
  if (DEBUG)
    logger.debug(
      `replaceUserTask: exitingUserId: ${req.data.existingUserId}, newUserId: ${req.data.newUserId}`
    );

  const { db, postsManager, users } = services;

  await postsManager.replacePostsAuthor(
    req.data.existingUserId,
    req.data.newUserId
  );

  await db.run((manager) =>
    users.repo.deleteUser(req.data.existingUserId, manager)
  );
};
