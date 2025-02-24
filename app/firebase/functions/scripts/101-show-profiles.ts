import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  await services.db.run(async (manager) => {
    const profiles = await services.users.profiles.repo.getAll();

    profiles.map((profile) => {
      logger.info(`Profile: ${profile}`, profile);
    });

    const users = await services.users.repo.getAll();

    await Promise.all(
      users.map(async (userId: string) => {
        const user = await services.users.repo.getUser(userId, manager, true);
        logger.info(`User: ${user.userId}`, user);
      })
    );
  });
})();
