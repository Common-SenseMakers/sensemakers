import { enqueueParseUserPosts } from '../../src/posts/posts.task';

/** skip for now as it will invalidate access tokens */
describe.only('twitter integration', () => {
  it(`triggers the parse task`, async () => {
    const userId = '1234';
    await enqueueParseUserPosts(userId, 'us-central1');
  });
});
