import { AppPostFull, PostsQuery } from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { PostsManager } from '../posts/posts.manager';

export class FeedService {
  constructor(
    protected db: DBInstance,
    protected postsManager: PostsManager
  ) {}

  async getFeed(params: PostsQuery): Promise<AppPostFull[]> {
    const posts = await this.postsManager.processing.posts.getMany(params);

    const postsFull = await Promise.all(
      posts.map((post) => this.postsManager.appendMirrors(post))
    );

    return postsFull;
  }
}
