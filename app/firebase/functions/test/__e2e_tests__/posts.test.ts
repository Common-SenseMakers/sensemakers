import { AppPostCreate, PLATFORM } from '../@shared/types';
import { HttpConnector } from './http.connector';

/** initialize firebase admin in test mode */
import './index.test';
import { getSemantics, publishPost } from './utils/posts';

describe('posts', () => {
  const http = new HttpConnector('dummy');

  before(async () => {});

  it('create', async () => {
    const content =
      'This is a recommendation of a book https://www.kirkusreviews.com/book-reviews/mordicai-gerstein/a-book/';
    const parsed = await getSemantics(content, http);
    console.log({ parsed });

    const post: AppPostCreate = {
      content,
      originalParsed: parsed,
      platforms: [PLATFORM.X, PLATFORM.Nanopubs],
    };

    const res2 = await publishPost(post, http);
    console.log({ res2 });
  });
});
