import { RefMeta } from '../src/@shared/types/types.parser';
import { LinkMeta } from '../src/@shared/types/types.references';
import { processInBatches } from '../src/db/db.utils';
import { servicesSource } from './migrations.services';

const DEBUG = false;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const linksIds = await servicesSource.links.links.getAll();

  const processLink = async (linkId: string) => {
    try {
      if (DEBUG) console.log(`Processing linkId ${linkId}`);

      await servicesSource.db.run(async (managerSource) => {
        const link = (await servicesSource.links.links.get(
          linkId,
          managerSource,
          true
        )) as any; // old data type

        if (link.oembed) {
          return;
        }

        const hadIframely =
          link['error'] !== undefined || link['cache_age'] !== undefined;
        const hadRefMeta = link['item_type'] !== undefined;

        const meta: LinkMeta = {
          oembed: link as RefMeta,
        };

        if (hadIframely) {
          meta.sources = {
            ...meta.sources,
            IFRAMELY: {
              status: link['error'] ? 'ERROR' : 'SUCCESS',
              timestamp: servicesSource.time.now(),
            },
          };
        }

        if (hadRefMeta) {
          meta.sources = {
            ...meta.sources,
            PARSER: {
              status: 'SUCCESS',
              timestamp: servicesSource.time.now(),
            },
          };
        }

        servicesSource.links.links.set(linkId, meta, managerSource);
      });
    } catch (error) {
      console.error(`Error processing ${linkId}`, error);
    }
  };

  await processInBatches(
    linksIds.map((linkId) => () => processLink(linkId)),
    10
  );
})();
