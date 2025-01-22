import { processInBatches } from '../src/db/db.utils';
import { servicesSource } from './migrations.services';
import { servicesTarget } from './migrations.services';

const DEBUG = false;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  /** copy links collection */
  const links = await servicesSource.links.links.getAll();

  await processInBatches(
    links.map(
      (element) => () =>
        (async (linkId: string) => {
          try {
            if (DEBUG) console.log(`Processing ${linkId}`);

            const link = await servicesSource.db.run((managerSource) => {
              return servicesSource.links.links.get(
                linkId,
                managerSource,
                true
              );
            });

            await servicesTarget.db.run(async (managerTarget) => {
              servicesTarget.links.links.create(link, managerTarget);
            });
          } catch (error) {
            console.error(`Error processing ${linkId}`, error);
          }
        })(element)
    ),
    10
  );
})();
