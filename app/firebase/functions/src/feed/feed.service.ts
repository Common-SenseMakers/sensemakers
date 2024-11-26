import {
  AppPostFull,
  HydrateConfig,
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

    const addAggregatedLabels =
      queryParams.hydrateConfig?.addAggregatedLabels !== undefined
        ? queryParams.hydrateConfig.addAggregatedLabels
        : false;

    const addMirrors =
      queryParams.hydrateConfig?.addMirrors !== undefined
        ? queryParams.hydrateConfig.addMirrors
        : true;

    const hydrateConfig: HydrateConfig = {
      addAggregatedLabels,
      addMirrors,
    };

    const posts = await this.postsManager.processing.posts.getMany(queryParams);

    const postsFull = await Promise.all(
      posts.map((post) =>
        this.db.run((manager) =>
          this.postsManager.processing.hydratePostFull(
            post,
            hydrateConfig,
            manager
          )
        )
      )
    );

    return postsFull;
  }
}
