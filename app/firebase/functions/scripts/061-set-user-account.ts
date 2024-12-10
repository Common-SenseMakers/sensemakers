import { PLATFORM } from '../src/@shared/types/types.platforms';
import { logger } from '../src/instances/logger';
import { UsersHelper } from '../src/users/users.helper';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const users = await services.users.repo.getAll();
  logger.info(`Processing ${users.length} users`);

  const userId = process.env.USER_ID;
  if (!userId) {
    throw new Error('USER_ID not defined in .script.env');
  }

  await services.db.run(async (manager) => {
    const user = await services.users.repo.getUser(userId, manager, true);
    const account = UsersHelper.getAccount(
      user,
      PLATFORM.Twitter,
      undefined,
      true
    );
    logger.info({ account });
  });
})();
