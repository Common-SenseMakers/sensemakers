import { Services } from '../instances/services';

export async function fetchNewPosts(services: Services) {
  await services.postsManager.fetchAll();
}
