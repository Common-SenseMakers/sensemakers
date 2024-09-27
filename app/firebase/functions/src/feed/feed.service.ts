import { FetchParams } from '../@shared/types/types.fetch';
import { DBInstance } from '../db/instance';
import { PostsManager } from '../posts/posts.manager';

export class FeedService {
  constructor(
    protected db: DBInstance,
    protected postsManager: PostsManager
  ) {}

  async getFeed(fetchParams: FetchParams, labelsUris: string[]) {
    const posts = await this.postsManager.processing.posts.getMany({
      fetchParams,
      labels: labelsUris,
    });
    return posts;
  }
}
