import { AccountProfile } from '../src/@shared/types/types.profiles';
import { processInBatches } from '../src/db/db.utils';
import { services } from './scripts.services';

const DEBUG = true;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const value = process.env.DISABLE_ENABLE === 'enable';
  const profiles = await services.users.profiles.getAll();

  const processItem = async (profile: AccountProfile) => {
    try {
      if (DEBUG) console.log(`Processing ${profile.id}`);

      await services.db.run(async (manager) => {
        return services.users.profiles.update(
          profile.id,
          { autofetch: value },
          manager
        );
      });
    } catch (error) {
      console.error(`Error processing ${profile.id}`, error);
    }
  };

  await processInBatches(
    profiles.map((p) => () => processItem(p)),
    10
  );
})();
