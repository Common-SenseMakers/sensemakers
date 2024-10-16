import { PostsQueryStatus } from '../src/@shared/types/types.posts';
import { services } from './scripts.services';

const mandatory = ['USER_ID'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const userId = process.env.USER_ID as string;

(async () => {
  const posts = await services.postsManager.processing.posts.getMany({
    userId,
    status: PostsQueryStatus.DRAFTS,
    fetchParams: { expectedAmount: 1 },
  });

  console.log('posts', JSON.stringify(posts, null, 2));
})();
