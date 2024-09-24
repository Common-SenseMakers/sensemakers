import { FetchParams } from '../@shared/types/types.fetch';
import { DBInstance } from '../db/instance';
import { PostsManager } from '../posts/posts.manager';

export class FeedService {
  constructor(
    protected db: DBInstance,
    protected postsManager: PostsManager
  ) {}

  async getFeed(fetchParams: FetchParams) {
    const triples =
      await this.postsManager.processing.triples.getWithPredicates(fetchParams);

    const postsIdsSet = new Set<string>();
    const postsIds = new Array<string>();

    /** deduplicate while keeping the order */
    for (const triple of triples) {
      if (!postsIdsSet.has(triple.postId)) {
        postsIdsSet.add(triple.postId);
        postsIds.push(triple.postId);
      }
    }

    const posts = await this.postsManager.processing.posts.getFromIds(postsIds);
    return posts;
  }
}
