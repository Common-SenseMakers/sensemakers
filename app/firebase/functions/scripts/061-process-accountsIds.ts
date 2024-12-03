import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const users = await services.users.repo.getAll();
  logger.info(`Processing ${users.length} users`);
})();
