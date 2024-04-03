import { ALL_PUBLISH_PLATFORMS, PLATFORM } from '../@shared/types';
import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types.parser';
import {
  AppPost,
  AppPostMirror,
  MirrorStatus,
  PostToPublish,
} from '../@shared/types.posts';
import { ParserService } from '../parser/parser.service';
import { FetchUserPostsParams } from '../platforms/platforms.interface';
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
    const posts = await Promise.all(
      platformPosts.map(async (platformPost): Promise<AppPost> => {
        const { content } = await this.platforms.convertToGeneric(platformPost);

        /** the original post is stored as one mirror of the AppPost */
        const mirror: MirrorStatus = {
          platformId: platformPost.platformId,
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
      })
    );

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
    const users = await this.users.repo.getAll();
    const params = new Map();

    /**
     * organize the credentials and lastFetched timestamps for
     * all users and platforms
     */
    users.forEach((user) => {
      ALL_PUBLISH_PLATFORMS.map((platformId) => {
        /** check if the user has credentials for that platform */
        const accounts = user[platformId];
        if (accounts) {
          accounts.forEach((account) => {
            const current = params.get(platformId) || [];
            const thisParams: FetchUserPostsParams = {
              start_time: account.read
                ? account.read.lastFetchedMs
                : account.signupDate,
              userDetails: account,
            };
            params.set(platformId, current.concat(thisParams));
          });
        }
      });
    });

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

  /**
   * Calls the convertFromGeneric on all platforms, other than the post origin,
   * and store the results as the platformDraft of each mirror
   * */
  public async preProcess(posts: AppPost[], store: boolean = false) {
    posts.forEach((post) => {
      ALL_PUBLISH_PLATFORMS.forEach((platformId) => {
        if (post.origin !== platformId) {
          const platformDraft = this.platforms
            .get(platformId)
            .convertFromGeneric(post);

          const mirror: MirrorStatus = {
            platformId,
            user_id: '',
            status: 'draft',
            postApproval: 'pending',
            platformDraft,
          };

          post.mirrors = {
            ...post.mirrors,
            [platformId]: mirror,
          };
        }
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
   * Update and mark the mirroring of a post on different platforms as approved.
   * If publish flag is true, and publish the mirror son the corresponding platform
   *
   * userId MUST be the authenticated user
   * */
  public async approveMirrors(postsToMirror: AppPostMirror[], userId: string) {
    /** validate posts authors, organize them by platform and append publish credentials */
    const postsPerPlatform: Map<PLATFORM, PostToPublish[]> = new Map();
    const user = await this.users.repo.getUser(userId, true);

    await Promise.all(
      postsToMirror.map(async (postToMirror) => {
        /** verify authorship */
        const post = await this.repo.getPost(postToMirror.postId, true);

        if (post.authorId !== userId) {
          throw new Error(`Post ${post.id} not owned by ${userId}`);
        }

        /** prepare posts and userDetails */
        postToMirror.mirrors.map((mirrorDetails) => {
          const platformId = mirrorDetails.platformId;
          const current = postsPerPlatform.get(platformId) || [];

          if (platformId === PLATFORM.Local) {
            throw new Error('Unexpected');
          }
          const accounts = user[platformId];

          if (!accounts) {
            throw new Error('Unexpected');
          }

          const account = accounts.find(
            (a) => a.user_id === mirrorDetails.user_id
          );

          if (!account) {
            throw new Error('Unexpected');
          }

          current.push({ post, userDetails: account });
          postsPerPlatform.set(platformId as PLATFORM, current);
        });
      })
    );

    /** publish on each platform */
    const allPosts: AppPost[] = [];
    await Promise.all(
      Array.from(postsPerPlatform.entries()).map(
        async ([platform, postsToPublish]) => {
          const platformPosts = await this.platforms
            .get(platform)
            .publish(postsToPublish);

          /** inject each platform post as a mirror on its corresponding AppPost */
          platformPosts.forEach((platformPost) => {
            const postToPublish = postsToPublish.find(
              (p) => p.post.id === platformPost.post_id
            );

            if (!postToPublish) {
              throw new Error(
                `Unexpected not found post for platformPost ${platformPost.post_id}`
              );
            }

            postToPublish.post.mirrors = {
              [platformPost.platformId]: {
                platformPost,
              },
            };
          });

          allPosts.push(...postsToPublish.map((p) => p.post));
        }
      )
    );

    await this.repo.updatePostsMirrors(allPosts);
  }
}
