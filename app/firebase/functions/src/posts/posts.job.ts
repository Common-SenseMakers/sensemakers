import { createServices } from 'src/instances/services';

export async function fetchNewPosts() {
  const { posts: postsService } = createServices();
  await postsService.process();
}
