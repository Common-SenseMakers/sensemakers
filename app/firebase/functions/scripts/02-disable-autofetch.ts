import { AccountProfile } from '../src/@shared/types/types.profiles';
import { processInBatches } from '../src/db/db.utils';
import { services } from './scripts.services';

const DEBUG = true;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const profiles = await services.profiles.repo.getAll();

  const process = async (profile: AccountProfile) => {
    try {
      if (DEBUG) console.log(`Processing ${profile.id}`);

      await services.db.run(async (manager) => {
        return services.profiles.repo.update(
          profile.id,
          { autofetch: false },
          manager
        );
      });
    } catch (error) {
      console.error(`Error processing ${profile.id}`, error);
    }
  };

  await processInBatches(
    profiles.map((p) => () => process(p)),
    10
  );
})();
