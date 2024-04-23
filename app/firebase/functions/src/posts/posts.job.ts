import { createServices } from 'src/instances/services';

export async function fetchNewPosts() {
  const { postsManager } = createServices();
  await postsManager.fetchAll();
}
