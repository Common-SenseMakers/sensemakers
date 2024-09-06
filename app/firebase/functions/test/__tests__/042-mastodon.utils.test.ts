import { expect } from 'chai';
import fs from 'fs';
import { mastodon } from 'masto';

import {
  convertMastodonPostsToThreads,
  getPostUrl,
} from '../../src/platforms/mastodon/mastodon.utils';
import { MastodonPost, MastodonAccount } from '../../src/shared/types/types.mastodon';

describe('mastodon utility functions', () => {
  it('converts mastodon posts to threads', async () => {
    const result = JSON.parse(
      fs.readFileSync('./test/__tests__/mastodon.thread.mock.json', 'utf8')
    ) as { posts: MastodonPost[], author: MastodonAccount };

    const threads = convertMastodonPostsToThreads(result.posts, result.author);

    expect(threads).to.not.be.undefined;
    expect(threads.length).to.be.equal(1);
    expect(threads[0].posts.length).to.be.equal(4);

    const expectedThreadIds = [
      '109273050298231994',
      '109273050737064331',
      '109273051175897868',
      '109273051614731305',
    ];

    expect(threads[0].posts.map((post) => post.id)).to.deep.equal(
      expectedThreadIds
    );
  });

  it('generates correct post URL', () => {
    const username = 'testuser';
    const id = '109273050298231994';
    const url = getPostUrl(username, id);
    expect(url).to.equal('https://mastodon.social/@testuser/109273050298231994');
  });
});
