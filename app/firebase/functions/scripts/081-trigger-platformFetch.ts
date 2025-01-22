import { fetchPlatformAccountTask } from '../src/platforms/platforms.tasks';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const profileId = process.env.PROFILE_ID;
  if (!profileId) {
    throw new Error('PROFILE_ID not defined in .script.env');
  }

  await fetchPlatformAccountTask(
    {
      data: {
        amount: 10,
        latest: true,
        profileId,
      },
    },
    services
  );
})();
