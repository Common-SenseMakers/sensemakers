import { processInBatches } from '../src/db/db.utils';
import { services } from './scripts.services';

const DEBUG = true;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const profileIdsStr = process.env.PROFILE_IDS;
  if (!profileIdsStr) {
    throw new Error('PROFILE_IDS env var not defined in .script.env');
  }

  console.log(profileIdsStr);

  const profilesIds = JSON.parse(profileIdsStr) as string[];

  const processItem = async (profileId: string) => {
    try {
      if (DEBUG) console.log(`Processing ${profileId}`);

      await services.db.run(async (manager) => {
        return services.users.profiles.update(
          profileId,
          { autofetch: true },
          manager
        );
      });
    } catch (error) {
      console.error(`Error processing ${profileId}`, error);
    }
  };

  await processInBatches(
    profilesIds.map((p) => () => processItem(p)),
    10
  );
})();
