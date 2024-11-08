import {
  AppPostFull,
  PostsQuery,
  PostsQueryDefined,
} from '../@shared/types/types.posts';
import { DBInstance } from '../db/instance';
import { PostsManager } from '../posts/posts.manager';

export class FeedService {
  constructor(
    protected db: DBInstance,
    protected postsManager: PostsManager
  ) {}

  async getFeed(params: PostsQuery): Promise<AppPostFull[]> {
    const queryParams: PostsQueryDefined = {
      fetchParams: {
        ...params.fetchParams,
        expectedAmount: params.fetchParams?.expectedAmount || 10,
      },
      ...params,
    };

    const includeAggregateLabels =
      queryParams.includeAggregateLabels !== undefined
        ? queryParams.includeAggregateLabels
        : false;

    const posts = await this.postsManager.processing.posts.getMany(queryParams);

    const postsFull = await Promise.all(
      posts.map((post) =>
        this.db.run((manager) =>
          this.postsManager.processing.hydratePostFull(
            post,
            true,
            includeAggregateLabels,
            manager
          )
        )
      )
    );

    return postsFull;
  }
}
