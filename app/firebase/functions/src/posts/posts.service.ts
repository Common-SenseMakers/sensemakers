import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types.parser';
import { AppPost } from '../@shared/types.posts';
import { ParserService } from '../parser/parser.service';
import {
  FetchAllUserPostsParams,
  PlatformsService,
} from '../platforms/platforms.service';
import { UsersService } from '../users/users.service';
import { getPrefixedUserId, getUniquePostId } from '../users/users.utils';
import { PostsRepository } from './posts.repository';

export class PostsService {
  constructor(
    protected users: UsersService,
    protected platforms: PlatformsService,
    protected postsRepo: PostsRepository,
    protected parserService: ParserService
  ) {}

  /**
   * From a list of userIds and platform fetchs status details for each user,
   * this function fetch all recent posts from all platforms */
  async fetch(params: FetchAllUserPostsParams): Promise<AppPost[]> {
    /** call the fetch */
    const platformPosts = await this.platforms.fetchPostsSince(params);

    /** convert into internal format */
    const posts = platformPosts.map((platformPost): AppPost => {
      const postNoIds = this.platforms.convertToGeneric(platformPost);
      return {
        ...postNoIds,
        id: getUniquePostId(platformPost.platformId, platformPost.post_id),
        authorId: getPrefixedUserId(
          platformPost.platformId,
          platformPost.user_id
        ),
      };
    });

    return posts;
  }

  /** Store a list of posts in the Posts collection */
  async storePosts(posts: AppPost[]) {
    await this.postsRepo.storePosts(posts);
  }

  /**
   * Reads all registered users from the Users collection
   * and fetch their new posts.
   * (optional) it stores the posts in the Posts collection
   */
  async fetchFromUsers(store: boolean = false) {
    /**
     * TODO create the fetch params with the start timestamp
     * for each platform and user
     *  */
    // const userIds = await this.users.repo.getAllIds();
    const params = new Map();

    const posts = await this.fetch(params);

    /** optional store in case it is postponed */
    if (store) {
      await this.storePosts(posts);
    }

    return posts;
  }

  /** Parse a list of Posts and optionally stores them in the Posts collection */
  async parse(posts: AppPost[], store: boolean = false) {
    /** Prepare the ParsePostRequest */
    const postsToParse = posts.map(
      (post: AppPost): ParsePostRequest<TopicsParams> => {
        return {
          post,
          // TODO: this could be an env var but could also be read per user in the future
          params: {
            [PARSER_MODE.TOPICS]: { topics: ['science', 'technology'] },
          },
        };
      }
    );

    /** Call the parser */
    const parserResult = await this.parserService.parsePosts(postsToParse);

    /** Append semantics to each Post */
    let postsWithSemantics = posts;

    if (parserResult) {
      postsWithSemantics = posts.map((post): AppPost => {
        const parsedPostResult = parserResult.find((parsed) => parsed.post);
        return {
          ...post,
          originalParsed: parsedPostResult,
          semantics: parsedPostResult?.semantics,
        };
      });

      /** optional store in case it is postponed */
      if (store) {
        await this.storePosts(postsWithSemantics);
      }
    } else {
      throw new Error('Error parsing');
    }
  }

  /** Coordinate the fetch and parse processed. It only stores
   * on the parse step.
   */
  async processNewPosts() {
    const posts = await this.fetchFromUsers();
    await this.parse(posts, true);
  }
}
