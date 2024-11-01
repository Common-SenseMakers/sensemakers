import { expect } from 'chai';
import fs from 'fs';

import { MastodonPost } from '../../src/@shared/types/types.mastodon';
import { FetchedResult } from '../../src/@shared/types/types.platform.posts';
import {
  cleanMastodonContent,
  convertMastodonPostsToThreads,
} from '../../src/platforms/mastodon/mastodon.utils';

describe.skip('mastodon utility functions', () => {
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

  it('cleans Mastodon content', () => {
    const input =
      '<p><a href="https://cosocial.ca/tags/DWebCamp2024" class="mention hashtag" rel="tag">#<span>DWebCamp2024</span></a> was full of discussion and exploration which I&#39;d love to see in the space between conference and unconference with something like the triopticon workshop method to see what kind of synthesis emerges. <a href="https://cynefin.io/index.php/Triopticon" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="ellipsis">cynefin.io/index.php/Trioptico</span><span class="invisible">n</span></a></p><p>&quot;The Triopticon process was designed to provide a fresh compromise between a formal conference and the more unstructured unconference.&quot;</p>';

    const expectedOutput =
      '#DWebCamp2024 was full of discussion and exploration which I\'d love to see in the space between conference and unconference with something like the triopticon workshop method to see what kind of synthesis emerges. https://cynefin.io/index.php/Triopticon\n\n"The Triopticon process was designed to provide a fresh compromise between a formal conference and the more unstructured unconference."';

    const cleanedContent = cleanMastodonContent(input);
    expect(cleanedContent).to.equal(expectedOutput);
  });
});
