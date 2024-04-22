import { createServices } from '../instances/services';

export async function fetchNewPosts() {
  const { postsManager } = createServices();
  await postsManager.fetchAll();
}
