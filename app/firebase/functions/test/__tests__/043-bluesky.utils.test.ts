import { AppBskyFeedGetAuthorFeed } from '@atproto/api';
import { expect } from 'chai';
import fs from 'fs';

import { BlueskyPost } from '../../src/@shared/types/types.bluesky';
import {
  cleanBlueskyContent,
  convertBlueskyPostsToThreads,
  extractRKeyFromURI,
} from '../../src/platforms/bluesky/bluesky.utils';

describe('bluesky utility functions', () => {
  it('converts bluesky posts to threads', async () => {
    const did = process.env.BLUESKY_USER_ID;
    if (!did) {
      throw new Error('BLUESKY_USER_ID is not set');
    }

    const result = JSON.parse(
      fs.readFileSync('./test/__tests__/bluesky.fetch.result.mock.json', 'utf8')
    ) as AppBskyFeedGetAuthorFeed.OutputSchema;

    const posts = result.feed.map((item) => item.post as BlueskyPost);

    const threads = convertBlueskyPostsToThreads(posts, did).filter(
      (thread) =>
        thread.thread_id ===
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z'
    );

    expect(threads).to.not.be.undefined;
    expect(threads.length).to.be.equal(1);
    expect(threads[0].posts.length).to.be.equal(4);

    const expectedThreadIds = [
      'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
      'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
      'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
      'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdcb3w322z',
    ];

    expect(threads[0].posts.map((post) => post.uri)).to.deep.equal(
      expectedThreadIds
    );
  });

  it('cleans Bluesky content', () => {
    const input = 'This is a test post with a #hashtag and a @mention.';
    const post = {
      record: { text: input },
    } as BlueskyPost;
    const expectedOutput = 'This is a test post with a #hashtag and a .';

    const cleanedContent = cleanBlueskyContent(post);
    expect(cleanedContent).to.equal(expectedOutput);
  });

  it('replaces truncated URLs with full URLs using facets', () => {
    const post = {
      record: {
        text: 'lots of interesting papers on parenting:\n\nwww.semanticscholar.org/paper/For-th...\n\nwww.semanticscholar.org/paper/%E2%80...\n\nwww.semanticscholar.org/paper/Self-d...',
        facets: [
          {
            index: { byteStart: 42, byteEnd: 81 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#link',
                uri: 'https://www.semanticscholar.org/paper/For-the-love-of-my-child%3A-How-parents%E2%80%99-relative-for-Chen-Kim/abffb416b2ac8ca0ea55262e1b03d3df6e779f8a',
              },
            ],
          },
          {
            index: { byteStart: 83, byteEnd: 122 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#link',
                uri: 'https://www.semanticscholar.org/paper/%E2%80%9CTell-Me-About-Your-Child%2C-The-Relationship-with-A-Clercq-Prinzie/fc757da7a7c6d713df443de5680e9ac652582a8d',
              },
            ],
          },
          {
            index: { byteStart: 124, byteEnd: 163 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#link',
                uri: 'https://www.semanticscholar.org/paper/Self-determination-theory%3A-A-macrotheory-of-human-Deci-Ryan/a32f3435bb06e362704551cc62c7df3ef2f16ab1',
              },
            ],
          },
        ],
      },
    } as unknown as BlueskyPost;

    const expectedOutput = 'lots of interesting papers on parenting: https://www.semanticscholar.org/paper/For-the-love-of-my-child%3A-How-parents%E2%80%99-relative-for-Chen-Kim/abffb416b2ac8ca0ea55262e1b03d3df6e779f8a https://www.semanticscholar.org/paper/%E2%80%9CTell-Me-About-Your-Child%2C-The-Relationship-with-A-Clercq-Prinzie/fc757da7a7c6d713df443de5680e9ac652582a8d https://www.semanticscholar.org/paper/Self-determination-theory%3A-A-macrotheory-of-human-Deci-Ryan/a32f3435bb06e362704551cc62c7df3ef2f16ab1';

    const cleanedContent = cleanBlueskyContent(post);
    expect(cleanedContent).to.equal(expectedOutput);
  });
  it('extracts rKey from URI', () => {
    const uri = 'at://did:plc:example/app.bsky.feed.post/3j5sy9apqv2';
    const rkey = extractRKeyFromURI(uri);
    expect(rkey).to.equal('3j5sy9apqv2');
  });
});
