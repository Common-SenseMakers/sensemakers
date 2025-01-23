import { logger } from '../../src/instances/logger';
import { services } from '../scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const url = process.env.REFERENCE_URL;
  if (!url) {
    throw new Error('REFERENCE_URL not defined in .script.env');
  }

  await services.db.run(async (manager) => {
    const link = await services.links.getByUrl(url, manager, true);
    logger.info(`link found: ${link.oembed.url}`, { link });

    await services.links.refreshOEmbed(url, manager);
  });
})();
