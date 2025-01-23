import { logger } from '../../src/instances/logger';
import { services } from '../scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const profileId = process.env.PROFILE_ID;
  if (!profileId) {
    throw new Error('PROFILE_ID not defined in .script.env');
  }

  await services.db.run(async (manager) => {
    const profile = await services.users.profiles.getByProfileId(
      profileId,
      manager,
      true
    );
    logger.info(`Profile found: ${profile.id}`, { profile });
  });
})();
