import { expect } from 'chai';
import { OEmbed } from '../../src/@shared/types/types.references';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { getTestServices } from './test.services';

describe('020-links', () => {
  const services = getTestServices({
    time: 'mock',
    parser: 'mock'
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('getOEmbed', () => {
    const testUrl = 'https://example.com/test';
    const expectedOembed: OEmbed = {
      url: 'https://example.com/test',
      title: 'Test Title',
      summary: 'Test Summary'
    };

    it('should fetch and store oembed data for new urls', async () => {
      await services.db.run(async (manager) => {
        const result = await services.links.getOEmbed(testUrl, manager);
        
        expect(result).to.not.be.undefined;
        expect(result.url).to.equal(testUrl);
        // Note: actual response will depend on the mock implementation
        // of the fetch call in LinksService
      });
    });

    it('should return cached oembed data for existing urls', async () => {
      await services.db.run(async (manager) => {
        // First call to store the data
        await services.links.setOEmbed(expectedOembed, manager);
        
        // Second call should return cached data
        const result = await services.links.getOEmbed(testUrl, manager);
        
        expect(result).to.deep.equal(expectedOembed);
      });
    });
  });
});
