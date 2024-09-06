import { expect } from 'chai';
import fs from 'fs';

import { MastodonPost } from '../../src/@shared/types/types.mastodon';
import { FetchedResult } from '../../src/@shared/types/types.platform.posts';
import { convertMastodonPostsToThreads } from '../../src/platforms/mastodon/mastodon.utils';

describe.only('mastodon utility functions', () => {
  it('converts mastodon posts to threads', async () => {
    const result = JSON.parse(
      fs.readFileSync(
        './test/__tests__/mastodon.fetch.result.mock.json',
        'utf8'
      )
    ) as FetchedResult<MastodonPost>;

    const posts = result.platformPosts.map((platformPost) => platformPost.post);

    const threads = convertMastodonPostsToThreads(posts, posts[0].account);

    expect(threads).to.not.be.undefined;
    expect(threads.length).to.be.equal(1);
    expect(threads[0].posts.length).to.be.equal(3);

    const expectedThreadIds = [
      '113091840795490491', //https://cosocial.ca/@weswalla/113091840795490491
      '113091843958894093', //https://cosocial.ca/@weswalla/113091843958894093
      '113091846148998737', //https://cosocial.ca/@weswalla/113091846148998737
    ];

    expect(threads[0].posts.map((post) => post.id)).to.deep.equal(
      expectedThreadIds
    );
  });
});
