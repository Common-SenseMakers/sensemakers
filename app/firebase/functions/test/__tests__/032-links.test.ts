import { expect } from 'chai';

import { OEmbed } from '../../src/@shared/types/types.references';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { getTestServices } from './test.services';

describe.only('020-links', () => {
  const services = getTestServices({
    time: 'mock',
    parser: 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('getOEmbed', () => {
    const testUrl =
      'https://mikeyoungacademy.dk/bluesky-is-emerging-as-the-new-platform-for-science/';
    const expectedOembed: OEmbed = {
      url: 'https://mikeyoungacademy.dk/bluesky-is-emerging-as-the-new-platform-for-science/',
      title:
        'Bluesky is emerging as the new platform for science - Mike Young Academy',
      author: 'Mike Young',
      author_url: 'https://mikeyoungacademy.dk/author/mike/',
      provider_name: 'Mike Young Academy',
      description:
        'Scientific Twitter is about to find its true successor. And it is not X. This, our latest release, shows that the Bluesky network of scientists is growing — and growing.',
      thumbnail_url:
        'https://mikeyoungacademy.dk/wp-content/uploads/2024/11/MYA_PowerPoint_template.jpg',
      thumbnail_width: 1077,
      thumbnail_height: 741,
      html: '<div class="iframely-embed"><div class="iframely-responsive" style="padding-bottom: 68.8022%; padding-top: 120px;"><a href="https://mikeyoungacademy.dk/bluesky-is-emerging-as-the-new-platform-for-science/" data-iframely-url="//cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fmikeyoungacademy.dk%2Fbluesky-is-emerging-as-the-new-platform-for-science&key=0e594d2c1632921ed862e73f2c45c6b5"></a></div></div><script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>',
    };

    it('should fetch and store oembed data for new urls', async () => {
      const oembed = await services.db.run(async (manager) => {
        const result = await services.links.getOEmbed(testUrl, manager);
        return result;
      });
      expect({
        title: oembed.title,
        url: oembed.url,
        description: oembed.description,
        thumbnail_url: oembed.thumbnail_url,
      }).to.deep.equal({
        title: expectedOembed.title,
        url: expectedOembed.url,
        description: expectedOembed.description,
        thumbnail_url: expectedOembed.thumbnail_url,
      });
    });
  });
});
