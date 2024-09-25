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
    const expectedOutput =
      'This is a test post with a #hashtag and a @mention.';

    const cleanedContent = cleanBlueskyContent(input);
    expect(cleanedContent).to.equal(expectedOutput);
  });
  it.only('extracts rKey from URI', () => {
    const uri = 'at://did:plc:example/app.bsky.feed.post/3j5sy9apqv2';
    const rkey = extractRKeyFromURI(uri);
    expect(rkey).to.equal('3j5sy9apqv2');
  });
});
