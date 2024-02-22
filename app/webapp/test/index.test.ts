import {
  getPostSemantics,
  postMessage,
} from '../src/functionsCalls/post.requests';
import { PLATFORM } from '../src/shared/types';

describe('test', () => {
  const userId = 'dummyuser';
  it('works', async () => {
    const content = 'This is a post';
    const parsed = await getPostSemantics(content, userId);

    const post = await postMessage(
      {
        content,
        originalParsed: parsed,
        platforms: [PLATFORM.X],
      },
      userId
    );

    console.log({ post, parsed });
  });
});
