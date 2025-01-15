import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe.only('100 add accounts', async () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('adds accounts', () => {
    it('fetch and parse all posts', async () => {
      await services.profiles.parseAndAdd({
        cluster: 'test-cluster',
        profilesUrls: [
          'https://bsky.app/profile/adammarblestone.bsky.social',
          'https://x.com/michael_nielsen',
          'https://bsky.app/profile/elisabethbik.bsky.social',
        ],
      });
    });
  });
});
