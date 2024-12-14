import { expect } from 'chai';
import fs from 'fs';

import { AppPost } from '../../src/@shared/types/types.posts';
import { OEmbed } from '../../src/@shared/types/types.references';
import {
  handleQuotePostReference,
  normalizeUrl,
} from '../../src/@shared/utils/links.utils';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { getTestServices } from './test.services';

describe('020-links', () => {
  const services = getTestServices({
    time: 'mock',
    parser: 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });
  describe('handles quote post reference bug', () => {
    const post = {
      id: 'qcguDyDPYXRYEiiZOlkH',
      generic: {
        author: {
          id: '343566768',
          name: 'Brian Gordon',
          username: 'GordonBrianR',
          avatarUrl:
            'https://pbs.twimg.com/profile_images/2163220130/profile_picture_normal.JPG',
          platformId: 'twitter',
        },
        thread: [
          {
            url: 'https://x.com/GordonBrianR/status/1863710508047798290',
            content:
              'Noted https://twitter.com/colerotman/status/1863422595942773233',
            quotedThread: {
              author: {
                id: '456531793',
                name: 'Cole Rotman',
                username: 'ColeRotman',
                platformId: 'twitter',
              },
              thread: [
                {
                  content:
                    'There\'s a well-known expression in venture capital:\n\n"Only a handful of companies per year actually matter" \n\nI thought it would be interesting to go back and find the Series A deals that actually "mattered" each year with the benefit of hindsight: 👇',
                  url: 'https://x.com/ColeRotman/status/1863422595942773233',
                },
              ],
            },
          },
        ],
      },
    } as any as AppPost;

    const originalUrl =
      'https://twitter.com/colerotman/status/1863422595942773233';
    const normalizedUrl = normalizeUrl(originalUrl);
    const processedReference = handleQuotePostReference(normalizedUrl, post);
    expect(processedReference).to.equal(
      'https://x.com/ColeRotman/status/1863422595942773233'
    );
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

    it('processes the semantics of a post and stores the oembed data merged with citoid data', async () => {
      const testRef = 'https://x.com/ColeRotman/status/1863422595942773233';
      const testRefType = 'forumPost';

      const services = getTestServices({
        time: 'real',
        parser: 'real',
      });
      const testPost = JSON.parse(
        fs.readFileSync('./test/__tests__/032-mock.post.json', 'utf8')
      ) as AppPost;
      const post = await services.db.run(async (manager) => {
        return services.postsManager.processing.createAppPost(
          testPost,
          manager
        );
      });
      await services.db.run(async (manager) => {
        return services.postsManager.processing.processSemantics(
          post.id,
          manager,
          post.semantics
        );
      });

      const oembed = await services.db.run(async (manager) => {
        return services.links.getOEmbed(testRef, manager);
      });
      expect(oembed.type).to.equal(testRefType);
    });
  });
});
