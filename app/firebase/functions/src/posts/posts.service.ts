import { ALL_PUBLISH_PLATFORMS, PLATFORM } from '../@shared/types';
import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types.parser';
import {
  AppPost,
  AppPostMirror,
  AppPostPublish,
  MirrorStatus,
} from '../@shared/types.posts';
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
    protected repo: PostsRepository,
    protected parserService: ParserService
  ) {}

  /**
   * From a list of userIds and platform access credentials for each user,
   * this function fetch all recent posts from all platforms */
  async fetch(params: FetchAllUserPostsParams): Promise<AppPost[]> {
    /** call the fetch */
    const platformPosts = await this.platforms.fetch(params);

    /** convert into internal format */
    const posts = platformPosts.map((platformPost): AppPost => {
      const { content } = this.platforms.convertToGeneric(platformPost);

      /** the original post is stored as one mirror of the AppPost */
      const mirror: MirrorStatus = {
        user_id: platformPost.user_id,
        status: 'fetched',
        postApproval: 'not-needed',
        platformPost,
      };

      return {
        content,
        id: getUniquePostId(platformPost.platformId, platformPost.post_id),
        origin: platformPost.platformId,
        parseStatus: 'unprocessed',
        reviewedStatus: 'pending',
        authorId: getPrefixedUserId(
          platformPost.platformId,
          platformPost.user_id
        ),
        mirrors: {
          [platformPost.platformId]: mirror,
        },
      };
    });

    return posts;
  }

  /** Store a list of posts in the Posts collection */
  async storePosts(posts: AppPost[]) {
    await this.repo.storePosts(posts);
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

    if (parserResult) {
      posts = posts.map((post): AppPost => {
        const parsedPostResult = parserResult.find((parsed) => parsed.post);
        return {
          ...post,
          originalParsed: parsedPostResult,
          semantics: parsedPostResult?.semantics,
        };
      });

      /** optional store in case it is postponed */
      if (store) {
        await this.storePosts(posts);
      }
    } else {
      throw new Error('Error parsing');
    }

    return posts;
  }

  /** Calls the convertFromGeneric on all platforms and store the results as the platformDraft of each mirror  */
  public async preProcess(posts: AppPost[], store: boolean = false) {
    posts.forEach((post) => {
      ALL_PUBLISH_PLATFORMS.forEach((platformId) => {
        const platformDraft = this.platforms
          .get(platformId)
          .convertFromGeneric(post);

        const mirror: MirrorStatus = {
          status: 'draft',
          postApproval: 'pending',
          platformDraft,
        };

        post.mirrors = {
          ...post.mirrors,
          [platformId]: mirror,
        };
      });
    });

    /** optional store in case it is postponed */
    if (store) {
      await this.storePosts(posts);
    }

    return posts;
  }

  /**
   * Coordinate the fetch, parse and preProcess steps. It only stores
   * on the last step.
   */
  public async process() {
    const posts = await this.fetchFromUsers();
    const postsWithSemantics = await this.parse(posts);
    await this.preProcess(postsWithSemantics, true);
  }

  /**
   * Mirror a set of existing posts into other platforms. The content and
   * semantics of the post might have changed and will be updated
   * in the Posts collection too.
   *
   * userId MUST be the authenticated user
   * */
  public async mirror(postsToMirror: AppPostMirror[], userId: string) {
    /** validate posts authors and organize them by platform */
    const postsPerPlatform: Map<PLATFORM, AppPost[]> = new Map();

    await Promise.all(
      postsToMirror.map(async (postToMirror) => {
        const post = await this.repo.getPost(postToMirror.postId, true);

        if (post.authorId !== userId) {
          throw new Error(`Post ${post.id} not owned by ${userId}`);
        }

        postToMirror.platforms.forEach((platform) => {
          const current = postsPerPlatform.get(platform) || [];
          current.push(post);
          postsPerPlatform.set(platform, current);
        });
      })
    );

    /** call mirror on each platform */
    const allPosts: AppPost[] = [];
    await Promise.all(
      Array.from(postsPerPlatform.entries()).map(async ([platform, posts]) => {
        const platformPosts = await this.platforms
          .get(platform)
          .mirror(postsToMirror);

        /** inject each platform post as a mirror on its corresponding AppPost */
        platformPosts.forEach((platformPost) => {
          const post = posts.find((p) => p.id === platformPost.post_id);

          if (!post) {
            throw new Error(
              `Unexpected not found post for platformPost ${platformPost.post_id}`
            );
          }

          post.mirrors = {
            [platformPost.platformId]: {
              platformPost,
            },
          };
        });

        allPosts.push(...posts);
      })
    );

    /** store the updated posts in the DB */
    await this.storePosts(allPosts);
  }

  /**
   * CAUTION: userId MUST be an authenticated userId.
   *
   * This method will publish a post on a given platform and with a given
   * platform user_id. It verifies the account is controlled by the provided
   * userId and uses the stored write credentials for that account
   *
   * */
  async publish(
    userId: string,
    post: AppPostPublish,
    platformId: PLATFORM,
    user_id: string
  ) {
    const user = await this.users.repo.getUserWithPlatformAccount(
      platformId,
      user_id,
      true
    );

    if (user.userId !== userId) {
      throw new Error(
        `Account in platformId ${platformId} and user_id ${user_id} not controlled by ${userId}`
      );
    }

    /** get user write credentials for this account */
    const account = user[PLATFORM.Twitter]?.find((u) => u.user_id === user_id);

    if (!account || !account.write) {
      throw new Error(`Write credentials for user ${userId} not found`);
    }

    return this.platforms.publish(platformId, post, account);
  }
}
