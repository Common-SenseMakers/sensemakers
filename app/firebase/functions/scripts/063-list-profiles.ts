import { logger } from '../src/instances/logger';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const profiles = await services.users.profiles.getAll();
  logger.info(`Found ${profiles.length} profiles`);

  profiles.forEach((profile) => {
    console.log(`Profile found: ${profile.id}`);
  });
})();
