import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const users = await services.users.repo.getAll();
  logger.info(`Processing ${users.length} users`);

  const userId = 'twitter:1773032135814717440';

  await services.db.run(async (manager) => {
    const user = await services.users.repo.getUser(userId, manager, true);
    console.log({ user });
  });

  await services.db.run(async (manager) => {
    await services.users.repo.deleteUser(userId, manager);
  });
})();
